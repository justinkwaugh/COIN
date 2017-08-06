import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import March from '../../commands/march';
import CommandIDs from '../../config/commandIds';
import AeduiTrade from './aeduiTrade';
import AeduiSuborn from './aeduiSuborn';
import MovePieces from '../../actions/movePieces';
import HidePieces from '../../actions/hidePieces';
import RemoveResources from '../../actions/removeResources';
import EnemyFactionPriority from './enemyFactionPriority';
import FactionActions from '../../../common/factionActions';

const Checkpoints = {
    MARCH_COMPLETE_CHECK : 'mcc'
};


class AeduiMarch {

    static march(state, modifiers) {
        const faction = state.aedui;
        const turn = state.turnHistory.getCurrentTurn();

        if(!turn.getCheckpoint(Checkpoints.MARCH_COMPLETE_CHECK)) {
            if (state.frost()) {
                return false;
            }

            const effectiveMarch = this.findEffectiveMarch(state, modifiers, faction);
            if (!effectiveMarch) {
                return false;
            }
            turn.startCommand(CommandIDs.MARCH);
            const regionsMarched = {};

            if (effectiveMarch.expansionMarchRegions.length > 0) {
                console.log('*** Aedui march to expand ***');
                if (!modifiers.free) {
                    RemoveResources.execute(state,
                                            {factionId: FactionIDs.AEDUI, count: effectiveMarch.expansionMarchCost});
                }
                const expansionPieces = effectiveMarch.expansionMarchStartRegion.piecesByFaction()[FactionIDs.AEDUI];
                const expansionWarbands = _.filter(expansionPieces, {type: 'warband'});
                HidePieces.execute(
                    state, {
                        factionId: faction.id,
                        regionId: effectiveMarch.expansionMarchStartRegion.id
                    });

                _.each(
                    effectiveMarch.expansionMarchRegions, function (destinationRegion) {
                        const pieceToMove = expansionWarbands.shift();
                        MovePieces.execute(
                            state, {
                                sourceRegionId: effectiveMarch.expansionMarchStartRegion.id,
                                destRegionId: destinationRegion.id,
                                pieces: [pieceToMove]
                            });
                    });
                regionsMarched[effectiveMarch.expansionMarchStartRegion.id] = true;
            }

            if (effectiveMarch.controlMarchRegion) {
                console.log('*** Aedui march to control ***');
                if (!modifiers.free) {
                    RemoveResources.execute(state,
                                            {factionId: FactionIDs.AEDUI, count: effectiveMarch.controlMarchCost});
                }
                const controlPieces = effectiveMarch.controlMarchStart.piecesByFaction()[FactionIDs.AEDUI];
                const warbands = _(controlPieces).filter({type: 'warband'}).value();
                const numWarbandsNeeded = Math.abs(
                        effectiveMarch.controlMarchRegion.controllingMarginByFaction()[FactionIDs.AEDUI]) + 1;
                const controlWarbands = _.take(warbands, numWarbandsNeeded);
                if (!regionsMarched[effectiveMarch.controlMarchStart.id]) {
                    HidePieces.execute(
                        state, {
                            factionId: faction.id,
                            regionId: effectiveMarch.controlMarchStart.id
                        })
                }

                MovePieces.execute(
                    state, {
                        sourceRegionId: effectiveMarch.controlMarchStart.id,
                        destRegionId: effectiveMarch.controlMarchRegion.id,
                        pieces: controlWarbands
                    });

            }
            turn.commitCommand();
        }
        turn.markCheckpoint(Checkpoints.MARCH_COMPLETE_CHECK);

        const usedSpecialAbility = modifiers.canDoSpecial() && (AeduiTrade.trade(state, modifiers) || AeduiSuborn.suborn(state, modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static findEffectiveMarch(state, modifiers, faction) {
        const marchResults = _.filter(
            March.test(state, {factionId: FactionIDs.AEDUI}), function (marchResult) {
                return faction.resources() >= marchResult.cost || modifiers.free;
            });

        const rankedEnemyFactions = _(state.factions).sortBy(
            function (faction) {
                return (99 - faction.numAlliedTribesAndCitadelsPlaced()) + (EnemyFactionPriority[faction.id]);
            }).reject({id: FactionIDs.AEDUI}).value();

        const enemyFactionRankById = {};
        _.each(
            rankedEnemyFactions, function (faction, index) {
                enemyFactionRankById[faction.id] = index + 1;
            });

        const groupedEffectiveMarchesByPriority = _(marchResults).map(
            (marchResult) => {
                let priority = 'z';
                const region = marchResult.region;
                const pieces = region.piecesByFaction()[FactionIDs.AEDUI];
                const mobilePieces = _.filter(pieces, {isMobile: true});
                if (mobilePieces.length === 1 || region.controllingMarginByFaction()[FactionIDs.AEDUI] === 1) {
                    return;
                }

                let numMoveablePieces = mobilePieces.length - 1;
                if (region.controllingMarginByFaction()[FactionIDs.AEDUI] > 0) {
                    numMoveablePieces = Math.min(numMoveablePieces, region.controllingMarginByFaction()[FactionIDs.AEDUI] - 1);
                }
                const validDestinations = _.filter(
                    marchResult.destinations, function (destination) {
                        const pieces = destination.piecesByFaction()[FactionIDs.AEDUI];
                        const hiddenPieces = _.filter(
                            pieces, function (piece) {
                                if (piece.type === 'warband' && !piece.revealed()) {
                                    return true;
                                }
                            });
                        return hiddenPieces.length === 0;
                    });

                // rank destinations by most allied / citadels per enemy and control margin
                const prioritizedDestinations = this.prioritizeDestinationsByAlliesAndBasicControl(validDestinations, enemyFactionRankById);

                const piecesLeftToUseForControl = numMoveablePieces - 3;

                this.updateDestinationPriorityForSelfAndNeighborControl(prioritizedDestinations, piecesLeftToUseForControl, region);

                const groupedDestinationsByPriority = _.groupBy(prioritizedDestinations, 'priority');
                const finalDestinationsAndPriorityValues = [];
                const sortedPriorities = _.keys(groupedDestinationsByPriority).sort();
                let numToTake = Math.min(3, numMoveablePieces);
                while (numToTake > 0) {
                    const nextPriority = sortedPriorities.shift();
                    if (!nextPriority) {
                        break;
                    }
                    const priorityGroup = groupedDestinationsByPriority[nextPriority];
                    const chosenEntries = _.sampleSize(priorityGroup, numToTake);
                    finalDestinationsAndPriorityValues.push.apply(finalDestinationsAndPriorityValues, chosenEntries);
                    numToTake -= chosenEntries.length;
                }

                if (finalDestinationsAndPriorityValues.length > 0) {
                    const topDestinationPriority = _.first(finalDestinationsAndPriorityValues).priority;
                    priority = topDestinationPriority + (9 - _.countBy(finalDestinationsAndPriorityValues, 'priority')[topDestinationPriority]);
                }

                const chosenMarch = {};
                chosenMarch.priority = priority;
                chosenMarch.expansionMarchCost = finalDestinationsAndPriorityValues.length > 0 ? marchResult.cost : 0;
                chosenMarch.expansionMarchStartRegion = marchResult.region;
                chosenMarch.expansionMarchRegions = _.map(finalDestinationsAndPriorityValues, 'destination');
                const controlMarch = this.findControlMarch(modifiers, faction, marchResults, chosenMarch);
                if (controlMarch) {
                    chosenMarch.controlMarchCost = controlMarch.cost;
                    chosenMarch.controlMarchRegion = controlMarch.destination;
                    chosenMarch.controlMarchStart = controlMarch.startRegion;
                }

                return chosenMarch;
            }).compact().reject({priority: 'z'}).groupBy('priority').value();

        if (groupedEffectiveMarchesByPriority.length === 0) {
            return;
        }

        const sortedPriorities = _.keys(groupedEffectiveMarchesByPriority).sort();
        const priorityGroup = groupedEffectiveMarchesByPriority[_.first(sortedPriorities)];
        return _.sample(priorityGroup);
    }

    static prioritizeDestinationsByAlliesAndBasicControl(validDestinations, enemyFactionRankById) {
        return _(validDestinations).map(
            function (destination) {
                let destinationPriority = 'z';

                // First by most winning enemy tribe
                _.each(
                    destination.tribes(), function (tribe) {
                        if (tribe.alliedFactionId() && tribe.alliedFactionId() !== FactionIDs.AEDUI) {
                            const possiblePriority = 'a' + 10 + enemyFactionRankById[tribe.alliedFactionId()];
                            if (possiblePriority < destinationPriority) {
                                destinationPriority = possiblePriority;
                            }
                        }
                    });

                // Order them by control margin
                const controlMarginAfterPlacement = destination.controllingMarginByFaction()[FactionIDs.AEDUI] + 1;
                if (controlMarginAfterPlacement <= 0) {
                    const piecesNeeded = Math.abs(controlMarginAfterPlacement) + 1;
                    const controlBasedPriority = 'd' + 10 + piecesNeeded;
                    if (controlBasedPriority < destinationPriority) {
                        destinationPriority = controlBasedPriority;
                    }
                }
                return {
                    destination: destination,
                    priority: destinationPriority
                };
            }).sortBy('priority').value();
    }

    static updateDestinationPriorityForSelfAndNeighborControl(prioritizedDestinations, piecesLeftToTakeControl, startRegion) {
        _.each(
            prioritizedDestinations, function (prioritizedDestination) {
                const destination = prioritizedDestination.destination;
                if (_.startsWith(prioritizedDestination.priority, 'a')) {
                    return;
                }

                // Now consider how close we are to controlling the region by ourselves or a neighbor
                const controlMarginAfterPlacement = destination.controllingMarginByFaction()[FactionIDs.AEDUI] + 1;
                if (controlMarginAfterPlacement <= 0) {
                    const piecesNeeded = Math.abs(controlMarginAfterPlacement) + 1;
                    if (piecesNeeded <= piecesLeftToTakeControl) {
                        prioritizedDestination.priority = 'b' + 10 + piecesNeeded;
                        return;
                    }

                    const helpingNeighbor = _.find(
                        destination.adjacent, function (neighborToDestination) {
                            if (neighborToDestination.id === startRegion.id) {
                                return false;
                            }
                            const neighborPieces = neighborToDestination.piecesByFaction()[FactionIDs.AEDUI];
                            const neighborMobilePieces = _.filter(neighborPieces, {isMobile: true});
                            const numNeighborMoveablePieces = Math.min(neighborMobilePieces.length - 1, neighborToDestination.controllingMarginByFaction()[FactionIDs.AEDUI] - 1);
                            if (numNeighborMoveablePieces < 1) {
                                return false;
                            }
                            return piecesNeeded - numNeighborMoveablePieces <= 0;
                        });

                    if (helpingNeighbor) {
                        const neighborBasedPriority = 'c' + 10 + piecesNeeded;
                        if (neighborBasedPriority < prioritizedDestination.priority) {
                            prioritizedDestination.priority = neighborBasedPriority;
                        }
                    }
                }
            });
    }

    static findControlMarch(modifiers, faction, marchResults, chosenMarch) {
        const availableResources = faction.resources() - chosenMarch.expansionMarchCost;

        const groupedMarchesByDestinationPriority = _(marchResults).map(
            function (march) {
                const region = march.region;

                if (modifiers.limited && region.id !== chosenMarch.expansionMarchStartRegion.id) {
                    return;
                }

                const controlMarchCost = region.id !== chosenMarch.expansionMarchStartRegion.id ? march.cost : 0;
                if (!modifiers.free && controlMarchCost > availableResources) {
                    return;
                }

                const pieces = region.piecesByFaction()[FactionIDs.AEDUI];
                const mobilePieces = _.filter(pieces, {isMobile: true});
                if (mobilePieces.length === 1 || region.controllingMarginByFaction()[FactionIDs.AEDUI] === 1) {
                    return;
                }

                const numPiecesUsedForExpansion = region.id === chosenMarch.expansionMarchStartRegion.id ? chosenMarch.expansionMarchRegions.length : 0;
                let numMoveablePieces = mobilePieces.length - 1;
                if (region.controllingMarginByFaction()[FactionIDs.AEDUI] > 0) {
                    numMoveablePieces = Math.min(numMoveablePieces, region.controllingMarginByFaction()[FactionIDs.AEDUI] - 1);
                }
                numMoveablePieces -= numPiecesUsedForExpansion;

                if (numMoveablePieces <= 0) {
                    return;
                }

                const expansionRegionIds = _.map(chosenMarch.expansionMarchRegions, 'id');
                const groupedDestinationsByPriority = _(march.destinations).map(
                    function (destination) {
                        let destinationPriority = 'z';
                        const controlMarginAfterPlacement = destination.controllingMarginByFaction()[FactionIDs.AEDUI] +
                                                            (_.indexOf(expansionRegionIds, destination.id) ? 1 : 0);

                        if (controlMarginAfterPlacement <= 0) {
                            const piecesNeeded = Math.abs(controlMarginAfterPlacement) + 1;
                            if (numMoveablePieces < piecesNeeded) {
                                return;
                            }
                            destinationPriority = 'a' + 10 + piecesNeeded + '-' + controlMarchCost;
                        }
                        return {
                            destination: destination,
                            priority: destinationPriority
                        };
                    }).compact().reject({priority: 'z'}).groupBy('priority').value();

                if (groupedDestinationsByPriority.length === 0) {
                    return;
                }
                const sortedPriorities = _.keys(groupedDestinationsByPriority).sort();
                const priorityGroup = groupedDestinationsByPriority[_.first(sortedPriorities)];
                const chosenDestination = _.sample(priorityGroup);

                if (chosenDestination) {
                    return {
                        cost: controlMarchCost,
                        destination: chosenDestination.destination,
                        priority: chosenDestination.priority,
                        startRegion: march.region
                    };
                }
            }).compact().groupBy('priority').value();

        if (groupedMarchesByDestinationPriority.length === 0) {
            return;
        }

        const sortedPriorities = _.keys(groupedMarchesByDestinationPriority).sort();
        const priorityGroup = groupedMarchesByDestinationPriority[_.first(sortedPriorities)];
        return _.sample(priorityGroup);
    }
}

export default AeduiMarch;