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

class AeduiBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.AEDUI});
    }

    willHarass(factionId) {
        return factionId === FactionIDs.ARVERNI;
    }

    takeTurn(state) {
        const aeduiFaction = state.factionsById[this.factionId];

        if (this.shouldPassForNextCard(state)) {
            state.sequenceOfPlay.recordFactionAction(FactionIDs.AEDUI, FactionActions.PASS);
            return;
        }

        if (this.canPlayEvent(state) && AeduiEvent.handleEvent(state)) {
            state.sequenceOfPlay.recordFactionAction(FactionIDs.AEDUI, FactionActions.EVENT);
            return;
        }

        const action = this.executeCommand(state, new CommandModifiers(), aeduiFaction);
        state.sequenceOfPlay.recordFactionAction(FactionIDs.AEDUI, action);

    }

    executeCommand(state, modifiers) {
        const aeduiFaction = state.factionsById[this.factionId];

        let commandAction = FactionActions.PASS;
        if(modifiers.isCommandAllowed(CommandIDs.BATTLE)) {
            commandAction = AeduiBattle.battle(state, modifiers, this, aeduiFaction);
        }

        if(!commandAction && modifiers.isCommandAllowed(CommandIDs.RALLY)) {
            commandAction = AeduiRally.rally(state, modifiers, this, aeduiFaction);
        }

        let effectiveRaidRegions = null;
        if(!commandAction && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            effectiveRaidRegions = AeduiRaid.getEffectiveRaidRegions(state, modifiers);
            if (aeduiFaction.resources() < 4) {
                if (effectiveRaidRegions.length > 0) {
                    return AeduiRaid.raid(state, modifiers, this, aeduiFaction, effectiveRaidRegions);
                }
                else {
                    return FactionActions.PASS;
                }
            }
        }

        if(!commandAction && modifiers.isCommandAllowed(CommandIDs.MARCH)) {
            commandAction = AeduiMarch.march(state, modifiers, this, aeduiFaction);
        }

        if(!commandAction && modifiers.isCommandAllowed(CommandIDs.RAID)) {
            if (effectiveRaidRegions.length > 0) {
                return AeduiRaid.raid(state, modifiers, this, aeduiFaction, effectiveRaidRegions);
            }
        }

        return commandAction || FactionActions.PASS;
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
                    MovePieces.perform(state, {sourceRegion: relocation.region, destRegion: location.destination, pieces: relocation.pieces});
                    moved = true;
                    return false;
                }
            });

            if(!moved) {
                const piecesToRemove = _.filter(relocation.pieces, function(piece){
                   return piece.type === 'warband' && _.random(1,6) < 4;
                });

                if(piecesToRemove.length > 0) {
                    RemovePieces.perform(state, { factionId: this.factionId, region: relocation.region, pieces: piecesToRemove});
                }
            }
        });
    }

    shouldPassForNextCard(currentState) {
        return currentState.upcomingCard() && currentState.upcomingCard().type !== 'winter' && currentState.upcomingCard().initiativeOrder[0] === FactionIDs.AEDUI &&
               currentState.currentCard().initiativeOrder[0] !== FactionIDs.AEDUI &&
               _.random(1, 6) < 5;
    }
}

export default AeduiBot;