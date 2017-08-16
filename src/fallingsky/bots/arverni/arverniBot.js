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
import RemovePieces from 'fallingsky/actions/removePieces';
import Map from 'fallingsky/util/map';

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

    toJSON() {
        return Object.assign(super.toJSON(), {});
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

        if (!turn.getCheckpoint(Checkpoints.EVENT_CHECK) && !commandAction && !modifiers.noEvent && this.canPlayEvent(
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

        if (!modifiers.outOfSequence) {
            commandAction = commandAction || FactionActions.PASS;

            if (commandAction === FactionActions.PASS) {
                Pass.execute(state, {factionId: FactionIDs.ARVERNI});
            }

            state.sequenceOfPlay.recordFactionAction(FactionIDs.ARVERNI, commandAction);
        }
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

            const targets = this.getValidQuartersTargetsForRegion(state, region);

            return {
                region,
                warbands,
                leader,
                targets
            };

        }).compact().value();

        const leaderWillDoDevastationMove = _.find(devastatedMoveRegions, 'leader');
        const leaderRegion = this.findLeaderRegion(state);

        let massTarget = null;
        if (leaderRegion) {
            const massTargets = this.getValidQuartersTargetsForRegion(state, leaderRegion);
            if (!leaderWillDoDevastationMove) {
                massTargets.push(leaderRegion);
            }

            massTarget = _(massTargets).map(region => {
                let numWarbands = _.reduce(devastatedMoveRegions, (sum, sourceRegion) => {
                    if (_.find(_.map(sourceRegion.targets), target => target.id === region.id)) {
                        return sum + sourceRegion.region.getWarbandsOrAuxiliaForFaction(this.factionId).length;
                    }
                    else {
                        return sum;
                    }
                }, region.getWarbandsOrAuxiliaForFaction(this.factionId).length);

                let nonDevastatedMove = null;
                if (region.id === leaderRegion.id) {
                    nonDevastatedMove = _(leaderRegion.adjacent).reject(adjacent => adjacent.devastated() ||
                                                                                    adjacent.getWarbandsOrAuxiliaForFaction(
                                                                                        this.factionId).length < 1).map(
                        adjacent => {
                            const numWarbands = adjacent.getWarbandsOrAuxiliaForFaction(this.factionId).length;
                            const controlMargin = adjacent.controllingMarginByFaction()[this.factionId];
                            const numToMove = controlMargin < 1 ? numWarbands - 1 : Math.min(numWarbands - 1,
                                                                                             controlMargin - 1);

                            if (numToMove <= 0) {
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
                        this.factionId).length;
                    const leaderRegionControlMargin = leaderRegion.controllingMarginByFaction()[this.factionId];
                    const leaderRegionNumToMove = leaderRegionControlMargin < 1 ? numLeaderRegionWarbands - 1 : Math.min(
                        numLeaderRegionWarbands - 1, leaderRegionControlMargin - 2);

                    if (leaderRegionNumToMove > 0) {
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
                                this.factionId).length - nonDevastatedMove.numToMove;
                    }
                    else {
                        return sum + adjacent.getWarbandsOrAuxiliaForFaction(this.factionId).length;
                    }
                }, 0);

                const priority = (99 - numWarbands) + '-' + (99 - numAdjacentWarbands);

                return {
                    region,
                    nonDevastatedMove,
                    priority
                }
            }).sortBy('priority').first();

        }

        _.each(devastatedMoveRegions, moveRegion => {
            let destRegionId = null;
            if (massTarget && _.find(moveRegion.targets, target => target.id === massTarget.region.id)) {
                destRegionId = massTarget.region.id;
            }
            else if (moveRegion.targets.length > 0) {
                if (massTarget) {
                    destRegionId = _(moveRegion.targets).shuffle().sortBy(
                        target => Map.measureDistanceToRegion(state, moveRegion.region.id, target.id)).first().id;
                }
                else {
                    destRegionId = _.sample(moveRegion.targets).id;
                }
            }

            if (!destRegionId) {
                return;
            }

            const pieces = moveRegion.region.getMobilePiecesForFaction(this.factionId);
            MovePieces.execute(state, {
                sourceRegionId: moveRegion.region.id,
                destRegionId: destRegionId,
                pieces: pieces
            });
        });

        if (massTarget && massTarget.nonDevastatedMove) {
            const warbands = massTarget.nonDevastatedMove.region.getWarbandsOrAuxiliaForFaction(this.factionId);
            const leader = massTarget.nonDevastatedMove.region.getLeaderForFaction(this.factionId);
            const pieces = leader ? _.concat(warbands, [leader]) : warbands;
            MovePieces.execute(state, {
                sourceRegionId: massTarget.nonDevastatedMove.region.id,
                destRegionId: massTarget.region.id,
                pieces: pieces
            });
        }

        _.each(state.region, region => {
            if (!region.devastated()) {
                return;
            }

            const piecesToRemove = _.filter(region.getWarbandsOrAuxiliaForFaction(this.factionId),
                                            warband => _.random(1, 6) < 4);

            if (piecesToRemove.length > 0) {
                RemovePieces.execute(state, {
                    factionId: this.factionId,
                    regionId: region.id,
                    pieces: piecesToRemove
                });
            }

        });

    }

    getValidQuartersTargetsForRegion(state, region) {
        return _(region.adjacent).reject((adjacentRegion) => {
            return adjacentRegion.devastated() || !adjacentRegion.controllingFactionId() || adjacentRegion.controllingFactionId() === FactionIDs.GERMANIC_TRIBES;
        }).filter(
            adjacentRegion => adjacentRegion.controllingFactionId() === this.factionId || state.playersByFaction[adjacentRegion.controllingFactionId()].willAgreeToQuarters(
                state, this.factionId)).value();
    }

    findLeaderRegion(state) {
        return _.find(state.regions, (region) => {
            return _.find(region.piecesByFaction()[this.factionId], {type: 'leader'});
        });
    }
}

export default ArverniBot;