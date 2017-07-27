import Bot from '../bot';
import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import AeduiRaid from './aeduiRaid';
import AeduiRally from './aeduiRally';
import AeduiMarch from './aeduiMarch';
import AeduiBattle from './aeduiBattle';
import AeduiEvent from './aeduiEvent';
import FactionActions from '../../../common/factionActions';
import CommandIDs from '../../config/commandIds';
import MovePieces from '../../actions/movePieces';
import RemovePieces from '../../actions/removePieces';
import Pass from '../../commands/pass';

const Checkpoints = {
    PASS_CHECK: 1,
    EVENT_CHECK: 2,
    BATTLE_CHECK: 3,
    RALLY_CHECK: 4,
    FIRST_RAID_CHECK: 5,
    MARCH_CHECK: 6,
    SECOND_RAID_CHECK: 7
};

class AeduiBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.AEDUI});
    }

    willHarass(factionId) {
        return factionId === FactionIDs.ARVERNI;
    }

    takeTurn(state) {
        let action = null;
        const turn = state.turnHistory.currentTurn;
        const modifiers = turn.getContext();

        if (!turn.getCheckpoint(Checkpoints.PASS_CHECK) && !modifiers.outOfSequence && this.shouldPassForNextCard(
                state)) {
            action = FactionActions.PASS;
        }
        turn.markCheckpoint(Checkpoints.PASS_CHECK);
        if (!turn.getCheckpoint(Checkpoints.EVENT_CHECK) && !action && !modifiers.noEvent && this.canPlayEvent(
                state) && AeduiEvent.handleEvent(state)) {
            action = FactionActions.EVENT;
        }
        turn.markCheckpoint(Checkpoints.EVENT_CHECK);

        if (!action) {
            action = this.executeCommand(state, turn);
        }

        if (!modifiers.outOfSequence) {
            if (action === FactionActions.PASS) {
                Pass.execute(state, {factionId: FactionIDs.AEDUI});
            }
            state.sequenceOfPlay.recordFactionAction(FactionIDs.AEDUI, action);
        }
        return action;
    }

    executeCommand(state, turn) {
        let commandAction = null;
        const modifiers = turn.getContext();

        if (!turn.getCheckpoint(Checkpoints.BATTLE_CHECK) && modifiers.isCommandAllowed(CommandIDs.BATTLE)) {
            commandAction = AeduiBattle.battle(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.BATTLE_CHECK);

        if (!turn.getCheckpoint(Checkpoints.RALLY_CHECK) && !commandAction && modifiers.isCommandAllowed(
                CommandIDs.RALLY)) {
            commandAction = AeduiRally.rally(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.RALLY_CHECK);

        if (!turn.getCheckpoint(
                Checkpoints.FIRST_RAID_CHECK) && !commandAction && state.aedui.resources() < 4 && modifiers.isCommandAllowed(
                CommandIDs.RAID)) {
            commandAction = AeduiRaid.raid(state, modifiers) || FactionActions.PASS;
        }
        turn.markCheckpoint(Checkpoints.FIRST_RAID_CHECK);

        if (!turn.getCheckpoint(Checkpoints.MARCH_CHECK) && !commandAction && modifiers.isCommandAllowed(
                CommandIDs.MARCH)) {
            commandAction = AeduiMarch.march(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.MARCH_CHECK);

        if (!turn.getCheckpoint(Checkpoints.SECOND_RAID_CHECK) && !commandAction && modifiers.isCommandAllowed(
                CommandIDs.RAID)) {
            commandAction = AeduiRaid.raid(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.SECOND_RAID_CHECK);

        if (!modifiers.outOfSequence) {
            commandAction = commandAction || FactionActions.PASS;
        }

        return commandAction
    }

    quarters(state) {
        _(state.regions).filter(function (region) {
            return region.devastated();
        }).map((region) => {
            const pieces = region.piecesByFaction()[this.factionId] || [];
            const hasAllyOrCitadel = _.find(pieces, function (piece) {
                return piece.type === 'alliedtribe' || piece.type === 'citadel';
            });
            if (!hasAllyOrCitadel && pieces.length) {
                return {region, pieces};
            }
        }).compact().each((relocation) => {
            const adjacentLocations = _(relocation.region.adjacent).reject(function (adjacentRegion) {
                return !adjacentRegion.controllingFactionId() || adjacentRegion.controllingFactionId() === FactionIDs.GERMANIC_TRIBES;
            }).sortBy(function (destinations, factionId) {
                if (factionId === FactionIDs.AEDUI) {
                    return 'a';
                }
                else if (factionId === FactionIDs.ROMANS) {
                    return 'b';
                }
                else {
                    return 'd';
                }
            }).groupBy(function (adjacentRegion) {
                return adjacentRegion.controllingFactionId();
            }).map(function (destinations, factionId) {
                const destination = _.sample(destinations);
                return {factionId, destination};
            }).value();

            let moved = false;
            _.each(adjacentLocations, (location) => {
                if (location.factionId === this.factionId || state.playersByFaction[location.factionId].willAgreeToQuarters(
                        state, this.factionId)) {
                    MovePieces.execute(state, {
                        sourceRegionId: relocation.region.id,
                        destRegionId: location.destination.id,
                        pieces: relocation.pieces
                    });
                    moved = true;
                    return false;
                }
            });

            if (!moved) {
                const piecesToRemove = _.filter(relocation.pieces, function (piece) {
                    return piece.type === 'warband' && _.random(1, 6) < 4;
                });

                if (piecesToRemove.length > 0) {
                    RemovePieces.execute(state, {
                        factionId: this.factionId,
                        regionId: relocation.region.id,
                        pieces: piecesToRemove
                    });
                }
            }
        });
    }

    shouldPassForNextCard(currentState) {
        console.log('*** Aedui should pass for next card? ***');
        return currentState.upcomingCard() && currentState.upcomingCard().type !== 'winter' && currentState.upcomingCard().initiativeOrder[0] === FactionIDs.AEDUI &&
               currentState.currentCard().initiativeOrder[0] !== FactionIDs.AEDUI &&
               _.random(1, 6) < 5;
    }

    willAgreeRomans(state) {
        if (state.playersByFaction[FactionIDs.ROMANS].isNonPlayer) {
            return true;
        }
        else {
            const score = state.romans.victoryScore(state);
            if (score < 10) {
                return true;
            }
            else if (score >= 10 && score <= 12 && _.random(1, 6) < 5) {
                return true;
            }
        }
        return false;
    }

    willAgreeToQuarters(state, factionId) {
        if (factionId === FactionIDs.ROMANS) {
            return this.willAgreeRomans(state);
        }
        return false;
    }

    willAgreeToRetreat(state, factionId) {
        if (factionId === FactionIDs.ROMANS) {
            return this.willAgreeRomans(state);
        }
    }

    willAgreeToSupplyLine(state, factionId) {
        if (factionId === FactionIDs.ROMANS) {
            return this.willAgreeRomans(state);
        }
        return false;
    }
}

export default AeduiBot;