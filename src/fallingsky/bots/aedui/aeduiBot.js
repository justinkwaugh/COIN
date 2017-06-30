import Bot from '../bot';
import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import AeduiRaid from './aeduiRaid';
import AeduiRally from './aeduiRally';
import AeduiMarch from './aeduiMarch';
import AeduiBattle from './aeduiBattle';
import AeduiEvent from './aeduiEvent';
import FactionActions from '../../../common/factionActions';
import CommandModifiers from '../../commands/commandModifiers';
import CommandIDs from '../../config/commandIds';
import MovePieces from '../../actions/movePieces';
import RemovePieces from '../../actions/removePieces';
import Pass from '../../commands/pass';

const Checkpoints = {
    PASS_CHECK : 1,
    EVENT_CHECK : 2,
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

    takeTurn(state, modifiers) {
        let action = null;

        const checkpoint = state.turnHistory.getCurrentTurn().getCheckpoint();

        if (checkpoint < Checkpoints.PASS_CHECK && this.shouldPassForNextCard(state)) {
            action = FactionActions.PASS;
        }
        state.turnHistory.getCurrentTurn().markCheckpoint(Checkpoints.PASS_CHECK);

        if (checkpoint < Checkpoints.EVENT_CHECK && !action && this.canPlayEvent(state) && AeduiEvent.handleEvent(state)) {
            action = FactionActions.EVENT;
        }
        state.turnHistory.getCurrentTurn().markCheckpoint(Checkpoints.EVENT_CHECK);

        if(!action) {
            action = this.executeCommand(state, modifiers);
        }

        if(action === FactionActions.PASS) {
            Pass.execute(state, {factionId: FactionIDs.AEDUI});
        }

        state.sequenceOfPlay.recordFactionAction(FactionIDs.AEDUI, action);
        return action;
    }

    executeCommand(state, modifiers) {
        let commandAction = null;
        const checkpoint = state.turnHistory.getCurrentTurn().getCheckpoint();

        if(checkpoint < Checkpoints.BATTLE_CHECK && modifiers.isCommandAllowed(CommandIDs.BATTLE)) {
            commandAction = AeduiBattle.battle(state, modifiers);
        }
        state.turnHistory.getCurrentTurn().markCheckpoint(Checkpoints.BATTLE_CHECK);

        if(checkpoint < Checkpoints.RALLY_CHECK && !commandAction && modifiers.isCommandAllowed(CommandIDs.RALLY)) {
            commandAction = AeduiRally.rally(state, modifiers);
        }
        state.turnHistory.getCurrentTurn().markCheckpoint(Checkpoints.RALLY_CHECK);

        if (checkpoint < Checkpoints.FIRST_RAID_CHECK && !commandAction && state.belgae.resources() < 4 && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = AeduiRaid.raid(state, modifiers) || FactionActions.PASS;
        }
        state.turnHistory.getCurrentTurn().markCheckpoint(Checkpoints.FIRST_RAID_CHECK);

        if(checkpoint < Checkpoints.MARCH_CHECK && !commandAction && modifiers.isCommandAllowed(CommandIDs.MARCH)) {
            commandAction = AeduiMarch.march(state, modifiers);
        }
        state.turnHistory.getCurrentTurn().markCheckpoint(Checkpoints.MARCH_CHECK);

        if(checkpoint < Checkpoints.SECOND_RAID_CHECK && !commandAction && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            commandAction = AeduiRaid.raid(state, modifiers);
        }
        state.turnHistory.getCurrentTurn().markCheckpoint(Checkpoints.SECOND_RAID_CHECK);

        commandAction = commandAction || FactionActions.PASS;

        return commandAction
    }

    quarters(state) {
        _(state.regions).filter(function(region) {
            return region.devastated();
        }).map((region) =>{
            const pieces = region.piecesByFaction()[this.factionId] || [];
            const hasAllyOrCitadel = _.find(pieces, function(piece) {
                return piece.type === 'alliedtribe' || piece.type === 'citadel';
            });
            if(!hasAllyOrCitadel && pieces.length) {
                return { region, pieces };
            }
        }).compact().each((relocation) => {
            const adjacentLocations = _(relocation.region.adjacent).reject(function(adjacentRegion) {
                return !adjacentRegion.controllingFactionId();
            }).sortBy(function(destinations, factionId) {
                if (factionId === FactionIDs.AEDUI) {
                    return 'a';
                }
                else if(factionId === FactionIDs.ROMANS) {
                    return 'b';
                }
                else {
                    return 'd';
                }
            }).groupBy(function(adjacentRegion) {
                return adjacentRegion.controllingFactionId();
            }).map(function(destinations, factionId) {
                const destination = _.sample(destinations);
                return { factionId, destination };
            }).value();

            let moved = false;
            _.each(adjacentLocations, (location) => {
                if(location.factionId === this.factionId || state.playersByFaction[location.factionId].willAgreeToQuarters(this.factionId)) {
                    MovePieces.execute(state, {sourceRegionId: relocation.region.id, destRegionId: location.destination.id, pieces: relocation.pieces});
                    moved = true;
                    return false;
                }
            });

            if(!moved) {
                const piecesToRemove = _.filter(relocation.pieces, function(piece){
                   return piece.type === 'warband' && _.random(1,6) < 4;
                });

                if(piecesToRemove.length > 0) {
                    RemovePieces.execute(state, { factionId: this.factionId, regionId: relocation.region.id, pieces: piecesToRemove});
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
}

export default AeduiBot;