import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import FactionIDs from '../../config/factionIds';
import {CapabilityIDs} from 'fallingsky/config/capabilities';
import RegionGroups from '../../config/regionGroups';
import RegionIDs from '../../config/regionIds';
import March from '../../commands/march';
import MovePieces from '../../actions/movePieces';
import RemovePieces from '../../actions/removePieces';
import RemoveResources from '../../actions/removeResources';
import HidePieces from '../../actions/hidePieces';
import EnemyFactionPriority from './enemyFactionPriority';
import FactionActions from '../../../common/factionActions';
import Map from '../../util/map';
import RomanUtils from 'fallingsky/bots/romans/romanUtils';
import RomanBuild from 'fallingsky/bots/romans/romanBuild';
import RomanScout from 'fallingsky/bots/romans/romanScout';

class RomanMarch {

    static march(state, modifiers, skipCondition = false) {
        if (state.frost()) {
            return false;
        }

        let effective = false;
        const marchResults = March.test(state, {factionId: FactionIDs.ROMANS});

        const marches = this.getMarches(state, modifiers, marchResults);

        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.MARCH);
        console.log('*** Romans Marching ***');
        _.each(
            marches, (march) => {
                if (!this.payForMarchAndHide(state, modifiers, march)) {
                    return false;
                }

                if (march.groups) {
                    _.each(march.groups, (group) => {
                        MovePieces.execute(
                            state, {
                                sourceRegionId: march.region.id,
                                destRegionId: group.targetDestination.id,
                                pieces: this.getPiecesToMoveForRegion(march.region, group.pieceData)
                            });
                        if (group.pieceData.harassedAuxilia > 0) {
                            const harassedPieces = _.take(
                                march.region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS),
                                group.pieceData.harassedAuxilia);
                            RemovePieces.execute(state, {
                                factionId: FactionIDs.ROMANS,
                                regionId: march.region.id,
                                pieces: harassedPieces
                            })
                        }
                    });
                }
                effective = true;
            });

        if (!effective) {
            state.turnHistory.getCurrentTurn().rollbackCommand();
            return false;
        }
        state.turnHistory.getCurrentTurn().commitCommand();

        let didSpecial = false;
        if (modifiers.canDoSpecial()) {// && !this.wasBritanniaMarch(marches)) {
            didSpecial = RomanBuild.build(state, modifiers) || RomanScout.scout(state, modifiers);
        }

        return didSpecial ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getMarches(state, modifiers, marchResults) {
        const threatRegionIds = modifiers.context.threatRegions || [];
        const otherMarchRegionIds = _(state.regionsById).filter((region, id) => {
            const threatRegion = _.indexOf(threatRegionIds, id) >= 0;
            const noEnemyAlliesOrCitadels = !_.find(region.pieces(),
                                                    piece => (piece.type === 'alliedtribe' || piece.type === 'citadel') && piece.factionId !== FactionIDs.ROMANS);
            const hasMobileRomans = this.getMarchingPieces(region);

            return !threatRegion && region.inPlay() && noEnemyAlliesOrCitadels && hasMobileRomans;
        }).map((region, id) => region.id).value();

        const prioritizedFactions = this.getEnemyFactionPriority(state);

        const threatMarches = _.filter(marchResults, result => _.indexOf(threatRegionIds, result.region.id) >= 0);
        const otherMarches = _(marchResults).filter(
            result => _.indexOf(otherMarchRegionIds, result.region.id) >= 0).sortBy('cost').value();
        const allMarches = _.concat(threatMarches, otherMarches);
        const affordableMarches = this.getAffordableMarches(state, modifiers, allMarches);
        const marchData = this.prioritizeMarchDestinations(state, affordableMarches, prioritizedFactions,
                                                           threatRegionIds);

        if (state.romans.offMapLegions() > 5) {
            const marchToOneMarches = this.getMarchToOneMarches(state, modifiers, marchData);
            if (marchToOneMarches) {
                return marchToOneMarches;
            }
        }

        return this.getMarchToTwoMarches(state, modifiers, marchData);

    }

    static getAffordableMarches(state, modifiers, allMarches) {
        return modifiers.free || state.hasUnshadedCapability(CapabilityIDs.BAGGAGE_TRAINS, FactionIDs.ROMANS) ? allMarches : _.reduce(allMarches, (accumulator, march) => {
            if (accumulator.resourcesRemaining >= march.cost) {
                accumulator.resourcesRemaining -= march.cost;
                accumulator.marches.push(march);
            }
            return accumulator
        }, {resourcesRemaining: state.romans.resources(), marches: []}).marches;
    }

    static getDestinationPairs(state, modifiers, marchData) {
        const allDestinations = _(marchData).map('prioritizedDestinations').flatten().uniqBy(
            destinationData => destinationData.destination.id).value();

        // Assign bitvalue to each destination, equal to the sum of each valid march where the value for each is (2^marchindex)
        _.each(allDestinations, (destination) => {
            destination.bitvalue = _.reduce(marchData, (bitvalue, data, index) => {
                if (_.find(data.prioritizedDestinations,
                           destinationData => destinationData.destination.id === destination.destination.id)) {
                    return bitvalue += 2 ** index;
                }
                return bitvalue
            }, 0);
        });

        // Find all pairs of regions
        const allPairs = this.getDestinationCombinations(allDestinations);

        // Keep all that == 2^marchlen -1
        const allMarchedMask = (2 ** marchData.length) - 1;
        const allMarchedPairs = _.filter(allPairs, pair => (pair[0].bitvalue | pair[1].bitvalue) === allMarchedMask);

        // Find best priority in all pairs
        const bestPriority = _(allMarchedPairs).flatten().map('priority').uniq().sort().first();

        // Reject any that do not have that max priority
        const allMarchedWithBestPriority = _.filter(allMarchedPairs,
                                                    pair => pair[0].priority === bestPriority || pair[1].priority === bestPriority);

        // Group them by priority and take best group
        const groupedPairsByPriority = _.groupBy(allMarchedWithBestPriority,
                                                 pair => pair[0].priority + pair[1].priority);
        return groupedPairsByPriority[_(groupedPairsByPriority).keys().sort().first()];
    }

    static getDestinationCombinations(destinations) {
        if (destinations.length < 2) {
            return [];
        }

        const combinations = [];
        _.each(_.range(0, destinations.length - 1), (index) => {
            const head = _.nth(destinations, index);
            const tail = _.drop(destinations, index + 1);
            combinations.push.apply(combinations, _.map(tail, destination => [head, destination]));
        });
        return combinations;
    }

    static calculatePiecesToPairs(state, modifiers, marchData, pairs) {

        const numLegionsMarching = _.reduce(marchData, (sum, data) => {
            return sum + data.numLegions;
        }, 0);

        return _.map(pairs, pair => {
            const first = {
                destination: pair[0].destination,
                priority: pair[0].priority,
                numLegions: pair[0].destination.getLegions().length,
                numAuxilia: pair[0].destination.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length,
                leader: pair[0].destination.getLeaderForFaction(FactionIDs.ROMANS),
                piecesFromRegion: {}
            };

            const second = {
                destination: pair[1].destination,
                priority: pair[1].priority,
                numLegions: pair[1].destination.getLegions().length,
                numAuxilia: pair[1].destination.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length,
                leader: pair[1].destination.getLeaderForFaction(FactionIDs.ROMANS),
                piecesFromRegion: {}
            };

            _.each(marchData, data => {
                first.piecesFromRegion[data.march.region.id] = {
                    regionId: data.march.region.id,
                    numLegions: 0,
                    numAuxilia: 0,
                    harassedAuxilia: 0,
                    leader: false
                };
                second.piecesFromRegion[data.march.region.id] = {
                    regionId: data.march.region.id,
                    numLegions: 0,
                    numAuxilia: 0,
                    harassedAuxilia: 0,
                    leader: false
                };
            });

            const numLegionsAtTargets = first.numLegions + second.numLegions;
            const totalLegions = numLegionsMarching + numLegionsAtTargets;
            const idealFirstLegionGroup = Math.floor(totalLegions / 2);
            const idealSecondLegionGroup = totalLegions - idealFirstLegionGroup;

            const groupedByChoice = _(marchData).map((data) => {
                const firstDest = _.find(data.prioritizedDestinations,
                                         marchDest => marchDest.destination.id === pair[0].destination.id);
                const secondDest = _.find(data.prioritizedDestinations,
                                          marchDest => marchDest.destination.id === pair[1].destination.id);

                const bothTooFarToSplit = firstDest && secondDest && (firstDest.distance === 3 && secondDest.distance === 3);
                const tooManyLossesToSplit = firstDest && secondDest && (firstDest.harassmentLosses + secondDest.harassmentLosses) > data.numAuxilia;

                return {
                    data,
                    firstDest,
                    secondDest,
                    canSplit: !bothTooFarToSplit && !tooManyLossesToSplit
                }
            }).groupBy((dataWithDests) => {
                if ((dataWithDests.firstDest && !dataWithDests.secondDest) || (dataWithDests.secondDest && !dataWithDests.firstDest)) {
                    return 'one';
                }
                return 'both';
            }).value();

            // Only one place to go, so go
            _.each(groupedByChoice.one, choiceData => {
                const target = choiceData.firstDest ? first : second;
                const targetDest = choiceData.firstDest || choiceData.secondDest;
                target.numLegions += choiceData.data.numLegions;
                const numArrivingAuxilia = choiceData.data.numAuxilia - targetDest.harassmentLosses;
                target.numAuxilia += numArrivingAuxilia;
                target.leader = choiceData.data.leader;
                const regionData = target.piecesFromRegion[choiceData.data.march.region.id];
                regionData.numLegions = choiceData.data.numLegions;
                regionData.numAuxilia = numArrivingAuxilia;
                regionData.harassedAuxilia += targetDest.harassmentLosses;
                regionData.leader = choiceData.data.leader;
            });

            // Partition greedily, legions, bringing auxilia to die if needed
            _.each(_(groupedByChoice.both).sortBy(choiceData => choiceData.data.numLegions).reverse().value(),
                   choiceData => {
                       // Legions
                       const ordered = _([first, second]).sortBy('numLegions').value();
                       const target = _.first(ordered);
                       const otherTarget = _.last(ordered);
                       const targetDest = (target.destination.id === choiceData.firstDest.destination.id) ? choiceData.firstDest : choiceData.secondDest;
                       const otherDest = (target.destination.id === choiceData.firstDest.destination.id) ? choiceData.secondDest : choiceData.firstDest;

                       if (!choiceData.canSplit) {
                           target.numLegions += choiceData.data.numLegions;
                           const numArrivingAuxilia = choiceData.data.numAuxilia - targetDest.harassmentLosses;
                           target.numAuxilia += numArrivingAuxilia;
                           target.leader = choiceData.data.leader;
                           const regionData = target.piecesFromRegion[choiceData.data.march.region.id];
                           regionData.numLegions += choiceData.data.numLegions;
                           regionData.numAuxilia += numArrivingAuxilia;
                           regionData.harassedAuxilia += targetDest.harassmentLosses;
                           regionData.leader = choiceData.data.leader;
                           choiceData.placed = true;
                           return;
                       }

                       const numToFirst = otherTarget.numLegions === idealSecondLegionGroup ? choiceData.data.numLegions : Math.min(
                           idealFirstLegionGroup - target.numLegions, choiceData.data.numLegions);
                       const remaining = choiceData.data.numLegions - numToFirst;
                       target.numLegions += numToFirst;
                       target.piecesFromRegion[choiceData.data.march.region.id].numLegions = numToFirst;
                       if (targetDest.harassmentLosses > 0) {
                           target.piecesFromRegion[choiceData.data.march.region.id].harassedAuxilia = targetDest.harassmentLosses;
                       }

                       if (remaining) {
                           otherTarget.numLegions += remaining;
                           otherTarget.piecesFromRegion[choiceData.data.march.region.id].numLegions = remaining;
                           if (otherDest.harassmentLosses > 0) {
                               otherTarget.piecesFromRegion[choiceData.data.march.region.id].harassedAuxilia = otherDest.harassmentLosses;
                           }
                       }
                   });

            // Partition greedily Auxilia, and place Leader
            _.each(_(groupedByChoice.both).sortBy(choiceData => choiceData.data.numAuxilia).reverse().value(),
                   choiceData => {
                       if (!choiceData.canSplit && choiceData.placed) {
                           return;
                       }

                       const ordered = _([first, second]).sortBy('numAuxilia').value();
                       const target = _.first(ordered);
                       const targetDest = (target.destination.id === choiceData.firstDest.destination.id) ? choiceData.firstDest : choiceData.secondDest;
                       const otherTarget = _.last(ordered);

                       // We've placed legions to the best of our ability so we go ahead and place the leader if he hasn't already gone
                       if (!first.leader && !second.leader && choiceData.data.leader) {
                           let leaderTarget;
                           let leaderTargetDest;
                           if (first.numLegions === second.numLegions) {
                               leaderTarget = choiceData.firstDest.distance > choiceData.secondDest.distance ? first : second;
                               leaderTargetDest = choiceData.firstDest.distance > choiceData.secondDest.distance ? choiceData.firstDest : choiceData.secondDest;
                           }
                           else {
                               leaderTarget = first.numLegions > second.numLegions ? first : second;
                               leaderTargetDest = first.numLegions > second.numLegions ? choiceData.firstDest  : choiceData.secondDest;
                           }
                           leaderTarget.leader = choiceData.data.leader;
                           leaderTarget.piecesFromRegion[choiceData.data.march.region.id].leader = true;
                           if (leaderTargetDest.harassmentLosses > 0 && leaderTarget.piecesFromRegion[choiceData.data.march.region.id].harassedAuxilia === 0) {
                               leaderTarget.piecesFromRegion[choiceData.data.march.region.id].harassedAuxilia = leaderTargetDest.harassmentLosses;
                           }
                       }

                       const numArrivingAuxilia = choiceData.data.numAuxilia - (targetDest.harassmentLosses + otherTarget.piecesFromRegion[choiceData.data.march.region.id].harassedAuxilia);
                       target.numAuxilia += numArrivingAuxilia;
                       target.piecesFromRegion[choiceData.data.march.region.id].numAuxilia += numArrivingAuxilia;
                   });

            // Fix the auxilia as best we can to an even partition
            let imbalance = Math.abs(first.numAuxilia - second.numAuxilia);
            if (imbalance > 1) {
                const bigger = _([first, second]).sortBy('numAuxilia').last();
                const orderedRegionPieces = _(bigger.piecesFromRegion).reject({numAuxilia: 0}).sortBy(
                    'numAuxilia').reverse().value();
                const splittable = _(orderedRegionPieces).filter(regionPieces => _.find(groupedByChoice.both,
                                                                                        choiceData => choiceData.data.march.region.id === regionPieces.regionId &&
                                                                                                      choiceData.canSplit)).value();
                _.each(splittable, (regionPieces) => {
                    const choiceData = _.find(groupedByChoice.both,
                                              choiceData => choiceData.data.march.region.id === regionPieces.regionId);
                    const smaller = (first.destination.id === bigger.destination.id) ? second : first;

                    const otherDest = (first.destination.id === bigger.destination.id) ? choiceData.secondDest : choiceData.firstDest;
                    const harassmentLosses = (smaller.piecesFromRegion[regionPieces.regionId].harassedAuxilia ? 0 : otherDest.harassmentLosses);
                    const piecesToMove = Math.floor(
                        Math.min(imbalance, regionPieces.numAuxilia - harassmentLosses) / 2);

                    if (piecesToMove > 0) {
                        bigger.numAuxilia -= (piecesToMove + harassmentLosses);
                        regionPieces.numAuxilia -= piecesToMove + harassmentLosses;
                        smaller.numAuxilia += piecesToMove;
                        smaller.piecesFromRegion[regionPieces.regionId].numAuxilia += piecesToMove;
                        if (harassmentLosses) {
                            smaller.piecesFromRegion[regionPieces.regionId].harassedAuxilia += harassmentLosses;
                        }

                        imbalance = Math.abs(first.numAuxilia - second.numAuxilia);
                        if (imbalance <= 1) {
                            return false;
                        }
                    }
                });
            }
            return [first, second];

        });

    }

    static determineBattleLosses(state, modifiers, marchData, populatedPairs) {
        _.each(populatedPairs, (pair) => {
            this.determineBattleLossesForTarget(state, modifiers, marchData, pair[0]);
            this.determineBattleLossesForTarget(state, modifiers, marchData, pair[1]);
        })
    }

    static determineBattleLossesForTargets(state, modifiers, marchData, targets) {
        _.each(targets, (target) => {
            this.determineBattleLossesForTarget(state, modifiers, marchData, target);
        });
    }

    static determineBattleLossesForTarget(state, modifiers, marchData, target) {
        const defendingPieces = this.getSimulationDefenderPieces(state, target);
        target.losses = RomanUtils.getWorstLossesForAllEnemyInitiatedBattlesInRegion(state, target.destination,
                                                                                     defendingPieces);
    }

    static getSimulationDefenderPieces(state, destData) {
        return _(destData.piecesFromRegion).map((regionData) => {
            const region = state.regionsById[regionData.regionId];
            return this.getPiecesToMoveForRegion(region, regionData);
        }).flatten().concat(state.regionsById[destData.destination.id].getPiecesForFaction(FactionIDs.ROMANS)).value();
    }

    static getPiecesToMoveForRegion(region, regionData) {
        const auxilia = _.take(region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS), regionData.numAuxilia);
        const legions = _.take(region.getLegions(), regionData.numLegions);
        const leader = regionData.leader ? [region.getLeaderForFaction(FactionIDs.ROMANS)] : [];
        return _.concat(auxilia, legions, leader);
    }

    static getMarchToTwoMarches(state, modifiers, marchData) {
        const pairs = this.getDestinationPairs(state, modifiers, marchData);
        const populatedPairs = this.calculatePiecesToPairs(state, modifiers, marchData, pairs);
        this.determineBattleLosses(state, modifiers, marchData, populatedPairs);
        const finalDestinationPair = _(populatedPairs).sortBy((pair) => pair[0].losses + pair[1].losses).first();
        if (!finalDestinationPair) {
            return [];
        }

        const marches = _(finalDestinationPair).map(destData => {
            return _(destData.piecesFromRegion).map((regionData) => {
                const region = state.regionsById[regionData.regionId];
                const pieces = this.getPiecesToMoveForRegion(region, regionData);
                if (pieces.length > 0) {
                    return {
                        region: region,
                        group: {
                            targetDestination: destData.destination,
                            pieceData: regionData,
                        }
                    };
                }
            }).compact().value();
        }).flatten().groupBy(groupData => groupData.region.id).map((regionData, regionId) => {
            return {
                region: state.regionsById[regionId],
                groups: _.map(regionData, 'group'),
            }
        }).value();

        _.each(marches, (march) => {
            const marchResult = _.find(marchData, entry => entry.march.region.id === march.region.id);
            march.cost = marchResult.march.cost;
        });

        return marches;

    }


    static canGoToDestination(destination, marchData) {
        return _.find(destination.possibleMarches,
                      possibleMarch => possibleMarch.marchData.march.region.id === marchData.march.region.id);
    }

    static getMarchToOneMarches(state, modifiers, marchData) {
        const allLegionsAndLeaderInMarchRegions = _.reduce(marchData, (sum, data) => {
                return sum + (data.numLegions + (data.leader ? 1 : 0));
            }, 0) === (12 - state.romans.offMapLegions()) + (state.romans.availableLeader() ? 0 : 1);

        if (!allLegionsAndLeaderInMarchRegions) {
            return [];
        }

        const requiredMarches = _.filter(marchData, data => data.numLegions > 0 || data.leader);

        if (modifiers.limited && requiredMarches.length > 1) {
            return [];
        }

        const cost = _.reduce(requiredMarches, (sum, data) => {
            return sum + data.march.cost;
        }, 0);

        if (!modifiers.free  && !state.hasUnshadedCapability(CapabilityIDs.BAGGAGE_TRAINS, FactionIDs.ROMANS) && state.romans.resources() < cost) {
            return [];
        }

        const possibleDestinations = _(requiredMarches).reduce((destinations, data) => {
            const marchDestinations = data.prioritizedDestinations;
            return destinations.length === 0 ? marchDestinations : _.intersectionBy(destinations, marchDestinations,
                                                                                    destData => destData.destination.id);
        }, []);

        if (possibleDestinations.length === 0) {
            return [];
        }

        const populatedDestinations = this.calculatePiecesToDestinations(state, modifiers, marchData,
                                                                         possibleDestinations);
        this.determineBattleLossesForTargets(state, modifiers, marchData, populatedDestinations);
        const actualDestination = _(populatedDestinations).sortBy('losses').first();
        if (!actualDestination) {
            return [];
        }

        const marches = _(actualDestination.piecesFromRegion).map((regionData) => {
            const region = state.regionsById[regionData.regionId];
            const pieces = this.getPiecesToMoveForRegion(region, regionData);
            if (pieces.length > 0) {
                return {
                    region: region,
                    groups: [{
                        targetDestination: actualDestination.destination,
                        pieceData: regionData,
                    }]
                };
            }
        }).compact().value();

        _.each(marches, (march) => {
            const marchResult = _.find(marchData, entry => entry.march.region.id === march.region.id);
            march.cost = marchResult.march.cost;
        });

        return modifiers.free || state.hasUnshadedCapability(CapabilityIDs.BAGGAGE_TRAINS, FactionIDs.ROMANS)? marches : _.reduce(marches, (accumulator, march) => {
            if (accumulator.resourcesRemaining >= march.cost) {
                accumulator.resourcesRemaining -= march.cost;
                accumulator.marches.push(march);
            }
            return accumulator
        }, {resourcesRemaining: state.romans.resources(), marches: []}).marches;

    }

    static calculatePiecesToDestinations(state, modifiers, marchData, destinations) {

        return _(destinations).map((destData) => {
            const target = {
                destination: destData.destination,
                priority: destData.priority,
                numLegions: destData.destination.getLegions().length,
                numAuxilia: destData.destination.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length,
                leader: destData.destination.getLeaderForFaction(FactionIDs.ROMANS),
                piecesFromRegion: {}
            };

            _.each(marchData, data => {
                const targetDestData = _.find(data.prioritizedDestinations,
                                              marchDest => marchDest.destination.id === target.destination.id);
                if (!targetDestData) {
                    return;
                }
                target.numLegions += data.numLegions;
                target.numAuxilia += data.numAuxilia - targetDestData.harassmentLosses;
                target.leader = data.leader;

                target.piecesFromRegion[data.march.region.id] = {
                    regionId: data.march.region.id,
                    numLegions: data.numLegions,
                    numAuxilia: data.numAuxilia - targetDestData.harassmentLosses,
                    harassedAuxilia: targetDestData.harassmentLosses,
                    leader: data.leader
                };
            });

            return target;
        }).value();
    }

    static getMarchingPieces(region) {
        const legions = region.getLegions();
        const leader = region.getLeaderForFaction(FactionIDs.ROMANS);
        const auxilia = region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);

        let numAuxiliaToMarch = 0;
        if (auxilia.length > 0) {
            const numInitialMarchedPieces = legions.length + (leader ? 1 : 0) + 1;
            const maxEnemyMarginAfterMarch = region.getMaxEnemyControllingMargin(
                    FactionIDs.ROMANS) + numInitialMarchedPieces;
            if (maxEnemyMarginAfterMarch > 0) {
                numAuxiliaToMarch = auxilia.length;
            }
            else {
                numAuxiliaToMarch = Math.min(Math.abs(maxEnemyMarginAfterMarch - 1), auxilia.length);
            }
        }

        return _(legions).concat([leader], _.take(auxilia, numAuxiliaToMarch)).compact().value();
    }

    static prioritizeMarchDestinations(state, marches, prioritizedFactions, threatRegionIds) {
        const marchRegionIds = _.map(marches, march => march.region.id);

        return _(marches).map((march) => {
            const marchingPieces = this.getMarchingPieces(march.region);
            const prioritizedDestinations = _(march.destinations).map(destination => {

                if (_.indexOf(marchRegionIds, destination) >= 0) {
                    return;
                }

                const pathData = this.getBestDestinationPath(state, marchingPieces, march.region, destination);
                if (!pathData) {
                    return;
                }

                const priority = _.reduce(FactionIDs, (priority, factionId) => {
                    if (destination.numAlliesAndCitadelsForFaction(factionId) <= 0) {
                        return priority;
                    }

                    const priorityIndex = this.getPriorityIndex(prioritizedFactions, factionId);
                    if (priorityIndex < 0) {
                        return priority;
                    }

                    const newPriority = 10 + priorityIndex;
                    return Math.min(newPriority, priority);

                }, 99);

                if (priority === 99) {
                    return;
                }

                return {
                    destination,
                    path: pathData.path,
                    distance: pathData.distance,
                    harassmentLosses: pathData.harassmentLosses,
                    priority
                }
            }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().value();

            return {
                march,
                numLegions: march.region.getLegions().length,
                numAuxilia: _.filter(marchingPieces, {type: 'auxilia'}).length,
                leader: march.region.getLeaderForFaction(FactionIDs.ROMANS),
                threat: _.indexOf(threatRegionIds, march.region.id) >= 0,
                prioritizedDestinations
            }
        }).value();
    }

    static getPriorityIndex(prioritizedFactions, factionId) {
        return _.findIndex(_.values(prioritizedFactions), (factions) => {
            return _.find(factions, {id: factionId});
        });
    }

    static getEnemyFactionPriority(state) {
        const targetGermans = state.factionsById[FactionIDs.GERMANIC_TRIBES].numAlliedTribesAndCitadelsPlaced() >= 2;
        let priorityFactions = _([FactionIDs.ARVERNI, FactionIDs.BELGAE, FactionIDs.AEDUI]).map(
            id => state.factionsById[id]).map((faction) => {
            const victoryMargin = faction.victoryMargin(state);
            if (victoryMargin < 0) {
                return;
            }
            const player = state.playersByFaction[faction.id];
            const priority = 'a' + (99 - victoryMargin) + '-' + (player.isNonPlayer ? 'b' : 'a');

            return {
                id: faction.id,
                priority
            }

        }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().value();

        if (targetGermans) {
            priorityFactions.push({id: FactionIDs.GERMANIC_TRIBES, priority: 'b'});
        }

        const roll = _.random(1, 6);
        if (roll < 5) {
            priorityFactions.push.apply(priorityFactions,
                                        _(state.factions).reject(faction => faction.id === FactionIDs.ROMANS).map(
                                            (faction) => {
                                                const priority = 'c' + (99 - faction.numAlliedTribesAndCitadelsPlaced());
                                                return {
                                                    id: faction.id,
                                                    priority
                                                };
                                            }).sortBy('priority').value());
        }
        else {
            priorityFactions.push.apply(priorityFactions,
                                        _(state.factions).reject(faction => faction.id === FactionIDs.ROMANS).map(
                                            (faction) => {
                                                const player = state.playersByFaction[faction.id];
                                                const priority = player.isNonPlayer ? 'd' : 'c';
                                                return {
                                                    id: faction.id,
                                                    priority
                                                };
                                            }).sortBy('priority').value());
        }

        return _.groupBy(_.uniqBy(priorityFactions, 'id'), 'priority');
    }

    static wasBritanniaMarch(marches) {
        return _.find(marches,
                      march => (march.region.id === RegionIDs.BRITANNIA || march.targetDestination.id === RegionIDs.BRITANNIA));
    }

    static payForMarchAndHide(state, modifiers, march, alreadyMarchedById = {}) {
        const romans = state.romans;

        if (!alreadyMarchedById[march.region.id]) {
            alreadyMarchedById[march.region.id] = true;
            if (romans.resources() < march.cost && !modifiers.free && !state.hasUnshadedCapability(CapabilityIDs.BAGGAGE_TRAINS, FactionIDs.ROMANS)) {
                return false;
            }

            if (!modifiers.free && !state.hasUnshadedCapability(CapabilityIDs.BAGGAGE_TRAINS,FactionIDs.ROMANS)) {
                RemoveResources.execute(state, {factionId: FactionIDs.ROMANS, count: march.cost});
            }
            HidePieces.execute(
                state, {
                    factionId: romans.id,
                    regionId: march.region.id
                });
            return true;
        }
    }

    static getBestDestinationPaths(state, marchingPieces, startRegion, destinations) {
        return _(destinations).map(
            (destination) => {
                return this.getBestDestinationPath(state, marchingPieces, startRegion, destination);
            }).compact().value();
    }

    static getBestDestinationPath(state, marchingPieces, startRegion, destination) {
        const distance = Map.measureDistanceToRegion(state, startRegion.id, destination.id);
        if (distance < 2) {
            return {
                destination,
                path: [startRegion.id, destination.id],
                harassmentLosses: 0
            };
        }

        const bestPath = _(Map.findPathsToRegion(state, startRegion.id, destination.id, 3)).reject(
            (path) => {
                return March.isInvalidMarchPath(state, path);
            }).map(
            (path) => {

                const harassmentLosses = _(path).slice(1, path.length - 1).map(
                    regionId => state.regionsById[regionId]).reduce((sum, region) => {
                    const regionLosses = this.harassmentLosses(state, FactionIDs.ARVERNI, region) +
                                         this.harassmentLosses(state, FactionIDs.BELGAE, region) +
                                         this.harassmentLosses(state, FactionIDs.AEDUI, region) +
                                         this.harassmentLosses(state, FactionIDs.GERMANIC_TRIBES, region);
                    return sum + regionLosses;
                }, 0);

                if (harassmentLosses > (path.length - 2)) {
                    return;
                }

                const numAuxilia = _.countBy(marchingPieces, 'type').auxilia || 0;

                if (harassmentLosses && numAuxilia < harassmentLosses) {
                    return;
                }

                return {
                    path,
                    distance: path.length - 1,
                    harassmentLosses
                }
            }).compact().orderBy(['harassmentLosses', 'distance']).first();

        if (!bestPath) {
            return;
        }

        return {
            destination,
            path: bestPath.path,
            distance: bestPath.distance,
            harassmentLosses: bestPath.harassmentLosses
        }

    }

    static harassmentLosses(state, factionId, region) {
        let losses = 0;
        const numHiddenEnemies = region.getHiddenPiecesForFaction(factionId).length;
        if (numHiddenEnemies >= 3) {
            const player = state.playersByFaction[factionId];
            if (player.willHarass(FactionIDs.ROMANS)) {
                losses = Math.floor(numHiddenEnemies / 3);
            }
        }
        return losses;
    }


}

export default RomanMarch