import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import SpecialAbilityIDs from '../../config/specialAbilityIds';
import Suborn from '../../commands/aedui/suborn';
import PlaceAlliedTribe from '../../actions/placeAlliedTribe';
import RemovePieces from '../../actions/removePieces';
import RemoveResources from '../../actions/removeResources';
import PlaceWarbands from '../../actions/placeWarbands';
import EnemyFactionPriority from './enemyFactionPriority';
import {CapabilityIDs} from '../../config/capabilities';

class AeduiSuborn {

    static suborn(currentState, modifiers) {
        console.log('*** Is Aedui Suborn effective? ***');
        const aeduiFaction = currentState.factionsById[FactionIDs.AEDUI];
        if (!modifiers.free && aeduiFaction.resources() === 0) {
            return false;
        }

        const possibleSuborns = Suborn.test(currentState);
        _.each(
            possibleSuborns, function (subornResult) {
                let priority = 'z';
                if ((aeduiFaction.resources() >= 2 || modifiers.free) && aeduiFaction.hasAvailableAlliedTribe() && subornResult.canPlaceAlly) {
                    const hasSubduedCity = _.find(
                        subornResult.region.tribes(), function (tribe) {
                            return tribe.isSubdued() && tribe.isCity && (!tribe.factionRestriction || tribe.factionRestriction === FactionIDs.AEDUI);
                        });
                    if (hasSubduedCity) {
                        priority = 'a1';
                    }
                    else {
                        priority = 'a2';
                    }
                }
                else if ((aeduiFaction.resources() >= 2 || modifiers.free) && subornResult.alliedFactions.length > 0) {
                    let topAllyRemovePriority = 'z';
                    _.each(
                        subornResult.alliedFactions, function (factionId) {
                            const faction = currentState.factionsById[factionId];
                            // Need non-player roman check involved here.
                            const priority = 'b' + (99 - faction.numAlliedTribesAndCitadelsPlaced()) + (EnemyFactionPriority[factionId]);
                            if (priority < topAllyRemovePriority) {
                                topAllyRemovePriority = priority;
                            }
                        });
                    priority = topAllyRemovePriority;
                }
                else if (aeduiFaction.availableWarbands().length > 0) {
                    priority = 'c';
                }
                else if (subornResult.mobileFactions.length > 0) {
                    let topMobileRemovePriority = 'z';
                    _.each(
                        subornResult.alliedFactions, function (factionId) {
                            const priority = 'd' + (EnemyFactionPriority[factionId]);
                            if (priority < topMobileRemovePriority) {
                                topMobileRemovePriority = priority;
                            }
                        });
                    priority = topMobileRemovePriority;
                }

                subornResult.priority = priority;
            });

        const prioritizedGroups = _(possibleSuborns).reject({priority: 'z'}).groupBy('priority').value();

        const sortedKeys = _.keys(prioritizedGroups).sort();
        const subornChoices = prioritizedGroups[sortedKeys[0]];
        const convictolitavis = currentState.hasUnshadedCapability(CapabilityIDs.CONVICTOLITAVIS);
        const chosenSuborns = _.sampleSize(subornChoices, convictolitavis ? 2 : 1);

        if (chosenSuborns.length > 0) {
            currentState.turnHistory.getCurrentTurn().startSpecialAbility(SpecialAbilityIDs.SUBORN);
            _.each(chosenSuborns, (chosenSuborn) => {
                this.executeSuborn(currentState, modifiers, chosenSuborn);
            });
            currentState.turnHistory.getCurrentTurn().commitSpecialAbility();
            return true;
        }

        return false;
    }

    static executeSuborn(state, modifiers, subornResult) {
        console.log('*** Aedui Suborn in ' + subornResult.region.name);
        const aeduiFaction = state.factionsById[FactionIDs.AEDUI];
        let piecesHandled = 0;
        if ((aeduiFaction.resources() >= 2 || modifiers.free) && aeduiFaction.hasAvailableAlliedTribe() && subornResult.canPlaceAlly) {
            const subdued = subornResult.region.subduedTribesForFaction(FactionIDs.AEDUI);
            let tribe = _.find(subdued, {'isCity': true});
            if (!tribe) {
                tribe = _.sample(subdued);
            }

            if(!modifiers.free) {
                RemoveResources.execute(state, {factionId: FactionIDs.AEDUI, count: 2});
            }
            PlaceAlliedTribe.execute(state, {factionId: aeduiFaction.id, regionId: subornResult.region.id, tribeId: tribe.id});
            piecesHandled += 1;
        }
        else if ((aeduiFaction.resources() >= 2 || modifiers.free) && subornResult.alliedFactions.length > 0) {
            const prioritized = _.sortBy(
                subornResult.alliedFactions, function (factionId) {
                    const faction = state.factionsById[factionId];
                    // Need non-player roman check involved here.
                    return 'b' + (99 - faction.numAlliedTribesAndCitadelsPlaced()) + (EnemyFactionPriority[factionId]);
                });

            const alliedTribes = _.filter(subornResult.region.piecesByFaction()[_.first(prioritized)], {type: 'alliedtribe'});
            let alliedTribe = _.find(
                alliedTribes, function (ally) {
                    const tribe = state.tribesById[ally.tribeId];
                    return tribe.isCity;
                });
            if (!alliedTribe) {
                alliedTribe = _.sample(alliedTribes);
            }
            console.log('Suborn allied tribe');
            subornResult.region.logState();
            if(!alliedTribe) {
                debugger;
            }
            if(!modifiers.free) {
                RemoveResources.execute(state, { factionId: FactionIDs.AEDUI, count: 2});
            }
            RemovePieces.execute(
                state, {
                    factionId: alliedTribe.factionId,
                    regionId: subornResult.region.id,
                    pieces: [alliedTribe]
                });

            piecesHandled += 1;
        }

        const numWarbandsToAdd = _.min([(modifiers.free ? 999 : aeduiFaction.resources()), aeduiFaction.availableWarbands().length, 3 - piecesHandled]);
        if (numWarbandsToAdd) {
            if(!modifiers.free) {
                RemoveResources.execute(state, { factionId: FactionIDs.AEDUI, count: numWarbandsToAdd});
            }
            PlaceWarbands.execute(state, {factionId: aeduiFaction.id, regionId: subornResult.region.id, count: numWarbandsToAdd});
            piecesHandled += numWarbandsToAdd;
        }

        const prioritizedFactions = _.sortBy(
            subornResult.mobileFactions, function (factionId) {
                return EnemyFactionPriority[factionId];
            });

        if (aeduiFaction.resources() > 0 || modifiers.free) {
            _.each(
                prioritizedFactions, function (factionId) {
                    const pieces = _(subornResult.region.piecesByFaction()[factionId]).filter(
                        function (piece) {
                            return piece.type === 'warband' || piece.type === 'auxilia';
                        }).sortBy(
                        function (piece) {
                            if (!piece.revealed()) {
                                return 'a';
                            }
                            else if (piece.scouted()) {
                                return 'c';
                            }
                            else {
                                return 'b';
                            }
                        }).value();

                    const numPiecesToRemove = _.min([(modifiers.free ? 999 : aeduiFaction.resources()), pieces.length, 3 - piecesHandled]);
                    if (numPiecesToRemove) {
                        if(!modifiers.free) {
                            RemoveResources.execute(state, { factionId: FactionIDs.AEDUI, count: numPiecesToRemove});
                        }
                        RemovePieces.execute(
                            state, {
                                factionId: factionId,
                                regionId: subornResult.region.id,
                                pieces: _.take(pieces, numPiecesToRemove)
                            });

                        piecesHandled += numPiecesToRemove;
                    }

                    if (piecesHandled === 3 || (aeduiFaction.resources() === 0 && !modifiers.free)) {
                        return false;
                    }
                });
        }
    }
}

export default AeduiSuborn;