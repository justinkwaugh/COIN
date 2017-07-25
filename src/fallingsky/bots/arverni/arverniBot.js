import _ from 'lib/lodash';
import Bot from '../bot';
import FactionIDs from '../../config/factionIds';
import ArverniEvent from './arverniEvent';
import ArverniBattle from './arverniBattle';
import ArverniRally from './arverniRally';
import ArverniRaid from './arverniRaid';
import ArverniMarch from './arverniMarch';
import CommandIDs from '../../config/commandIds';
import FactionActions from '../../../common/factionActions';
import Pass from '../../commands/pass';
import MovePieces from 'fallingsky/actions/movePieces';

const Checkpoints = {
    BATTLE_CHECK: 'battle',
    THREAT_MARCH_CHECK: 'threat-march',
    EVENT_CHECK: 'event',
    RALLY_CHECK: 'rally',
    SPREAD_MARCH_CHECK: 'spread-march',
    FIRST_RAID_CHECK: 'first-raid',
    MASS_MARCH_CHECK: 'mass-march',
    SECOND_RAID_CHECK: 'second-raid'

};

class ArverniBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.ARVERNI});
    }

    takeTurn(state) {
        let commandAction = null;
        const turn = state.turnHistory.currentTurn;
        const modifiers = turn.getContext();

        if (!turn.getCheckpoint(Checkpoints.BATTLE_CHECK) && modifiers.isCommandAllowed(CommandIDs.BATTLE)) {
            commandAction = ArverniBattle.battle(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.BATTLE_CHECK);

        if (!turn.getCheckpoint(Checkpoints.THREAT_MARCH_CHECK) && !commandAction && modifiers.isCommandAllowed(
                CommandIDs.MARCH) && modifiers.context.tryThreatMarch) {
            commandAction = ArverniMarch.march(state, modifiers, 'threat');
        }
        turn.markCheckpoint(Checkpoints.THREAT_MARCH_CHECK);

        if (!turn.getCheckpoint(Checkpoints.EVENT_CHECK) && !commandAction && this.canPlayEvent(
                state) && ArverniEvent.handleEvent(state)) {
            commandAction = FactionActions.EVENT;
        }
        turn.markCheckpoint(Checkpoints.EVENT_CHECK);

        if (!turn.getCheckpoint(Checkpoints.RALLY_CHECK) && !commandAction && modifiers.isCommandAllowed(
                CommandIDs.RALLY)) {
            commandAction = ArverniRally.rally(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.RALLY_CHECK);

        if (!turn.getCheckpoint(Checkpoints.SPREAD_MARCH_CHECK) && !commandAction && modifiers.isCommandAllowed(
                CommandIDs.MARCH)) {
            commandAction = ArverniMarch.march(state, modifiers, 'spread');
        }
        turn.markCheckpoint(Checkpoints.SPREAD_MARCH_CHECK);

        if (!turn.getCheckpoint(
                Checkpoints.FIRST_RAID_CHECK) && !commandAction && state.arverni.resources() < 4 && modifiers.isCommandAllowed(
                CommandIDs.RAID)) {
            commandAction = ArverniRaid.raid(state, modifiers) || FactionActions.PASS;
        }
        turn.markCheckpoint(Checkpoints.FIRST_RAID_CHECK);

        if (!turn.getCheckpoint(Checkpoints.MASS_MARCH_CHECK) && !commandAction && modifiers.isCommandAllowed(
                CommandIDs.MARCH)) {
            commandAction = ArverniMarch.march(state, modifiers, 'mass');
        }
        turn.markCheckpoint(Checkpoints.MASS_MARCH_CHECK);

        if (!turn.getCheckpoint(Checkpoints.SECOND_RAID_CHECK) && !commandAction && modifiers.isCommandAllowed(
                CommandIDs.RAID)) {
            commandAction = ArverniRaid.raid(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.SECOND_RAID_CHECK);

        commandAction = commandAction || FactionActions.PASS;

        if (commandAction === FactionActions.PASS) {
            Pass.execute(state, {factionId: FactionIDs.ARVERNI});
        }

        state.sequenceOfPlay.recordFactionAction(FactionIDs.ARVERNI, commandAction);
        return commandAction;
    }

    willHarass(factionId) {
        return factionId === FactionIDs.ROMANS;
    }

    quarters(state) {
        const devastatedMoveRegions = _(state.regions).filter((region) => {
            return region.devastated();
        }).map((region) => {
            const alliesAndCitadel = region.getAlliesAndCitadelForFaction(this.factionId);
            const warbands = region.getWarbandsOrAuxiliaForFaction(this.factionId);
            const leader = region.getLeaderForFaction(this.factionId);

            if (alliesAndCitadel.length > 0) {
                return;
            }

            if (warbands.length === 0 && !leader) {
                return;
            }

            const targets = this.getValidQuartersTargetsForRegion(region);

            return {
                region,
                warbands,
                leader,
                targets
            };

        }).compact().value();

        const leaderWillDoDevastationMove = _.find(devastatedMoveRegions, 'leader');
        const leaderRegion = this.findLeaderRegion(state);

        if (leaderRegion) {
            const massTargets = this.getValidQuartersTargetsForRegion(leaderRegion);
            if (!leaderWillDoDevastationMove) {
                massTargets.push(leaderRegion);
            }

            const massTarget = _(massTargets).map(region => {
                let numWarbands = _.reduce(devastatedMoveRegions, (sum, sourceRegion) => {
                    if (_.find(_.map(sourceRegion.targets), target => target.id === region.id)) {
                        return sum + sourceRegion.region.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length;
                    }
                    else {
                        return sum;
                    }
                }, region.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length);

                let nonDevastatedMove = null;
                if (region.id === leaderRegion.id) {
                    nonDevastatedMove = _(leaderRegion.adjacent).reject(adjacent => adjacent.devastated() ||
                                                                                    adjacent.getWarbandsOrAuxiliaForFaction(
                                                                                        FactionIDs.ARVERNI).length < 1).map(
                        adjacent => {
                            const numWarbands = adjacent.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length;
                            const controlMargin = adjacent.controllingMarginByFaction()[FactionIDs.ARVERNI];
                            const numToMove = controlMargin < 1 ? numWarbands - 1 : Math.min(numWarbands - 1,
                                                                                             controlMargin - 1);

                            if(numToMove <= 0) {
                                return;
                            }

                            return {
                                region: adjacent,
                                numToMove
                            };
                        }).compact().sortBy('numToMove').reverse().first();
                }
                else if (!leaderWillDoDevastationMove) {
                    const numLeaderRegionWarbands = leaderRegion.getWarbandsOrAuxiliaForFaction(
                        FactionIDs.ARVERNI).length;
                    const leaderRegionControlMargin = leaderRegion.controllingMarginByFaction()[FactionIDs.ARVERNI];
                    const leaderRegionNumToMove = leaderRegionControlMargin < 1 ? numLeaderRegionWarbands - 1 : Math.min(
                        numLeaderRegionWarbands - 1, leaderRegionControlMargin - 2);

                    if(leaderRegionNumToMove > 0) {
                        nonDevastatedMove = {
                            region: leaderRegion,
                            numToMove: leaderRegionNumToMove,
                            leader: true
                        }
                    }
                }

                if (nonDevastatedMove) {
                    numWarbands += nonDevastatedMove.numToMove;
                }

                const numAdjacentWarbands = _(region.adjacent).reject(
                    adjacent => _.find(devastatedMoveRegions, {id: adjacent.id})).reduce((sum, adjacent) => {
                    if (nonDevastatedMove && adjacent.id === nonDevastatedMove.id) {
                        return sum + adjacent.getWarbandsOrAuxiliaForFaction(
                                FactionIDs.ARVERNI).length - nonDevastatedMove.numToMove;
                    }
                    else {
                        return sum + adjacent.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length;
                    }
                }, 0);

                const priority = (99 - numWarbands) + '-' + (99 - numAdjacentWarbands);

                return {
                    region,
                    nonDevastatedMove,
                    priority
                }
            }).sortBy('priority').first();

            // debugger;

        }


        // .each((relocation) => {
        //     const adjacentLocations = _(relocation.region.adjacent).reject(function (adjacentRegion) {
        //         return adjacentRegion.devastated() || !adjacentRegion.controllingFactionId() || adjacentRegion.controllingFactionId() === FactionIDs.GERMANIC_TRIBES;
        //     }).sortBy(function (destinations, factionId) {
        //         if (factionId === FactionIDs.ARVERNI) {
        //             return 'a';
        //         }
        //         else {
        //             return 'b';
        //         }
        //     }).groupBy( adjacentRegion => adjacentRegion.controllingFactionId()).map(_.shuffle).flatten().value();
        //
        //     let moved = false;
        //     _.each(adjacentLocations, (location) => {
        //         if (location.controllingFactionId() === this.factionId || state.playersByFaction[location.controllingFactionId()].willAgreeToQuarters(
        //                 state, this.factionId)) {
        //             MovePieces.execute(state, {
        //                 sourceRegionId: relocation.region.id,
        //                 destRegionId: location.id,
        //                 pieces: relocation.pieces
        //             });
        //             moved = true;
        //             return false;
        //         }
        //     });
        //
        //
        //
        //
        //     if (!moved) {
        //         const piecesToRemove = _.filter(relocation.pieces, function (piece) {
        //             return piece.type === 'warband' && _.random(1, 6) < 4;
        //         });
        //
        //         if (piecesToRemove.length > 0) {
        //             RemovePieces.execute(state, {
        //                 factionId: this.factionId,
        //                 regionId: relocation.region.id,
        //                 pieces: piecesToRemove
        //             });
        //         }
        //     }
        // });
    }

    getValidQuartersTargetsForRegion(region) {
        return _(region.adjacent).reject(function (adjacentRegion) {
            return adjacentRegion.devastated() || !adjacentRegion.controllingFactionId() || adjacentRegion.controllingFactionId() === FactionIDs.GERMANIC_TRIBES;
        }).value();
    }

    findLeaderRegion(state) {
        return _.find(state.regions, function (region) {
            return _.find(region.piecesByFaction()[FactionIDs.ARVERNI], {type: 'leader'});
        });
    }
}

export default ArverniBot;