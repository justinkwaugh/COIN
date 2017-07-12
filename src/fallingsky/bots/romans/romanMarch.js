import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import FactionIDs from '../../config/factionIds';
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

                MovePieces.execute(
                    state, {
                        sourceRegionId: march.region.id,
                        destRegionId: march.targetDestination.id,
                        pieces: march.pieces
                    });
                effective = true;
            });

        if (!effective) {
            state.turnHistory.getCurrentTurn().rollbackCommand();
            return false;
        }
        state.turnHistory.getCurrentTurn().commitCommand();

        let didSpecial = false;
        if (modifiers.canDoSpecial() && !this.wasBritanniaMarch(marches)) {
            // didSpecial = RomanBuild.build(state, modifiers) || RomanScout.scout(state, modifiers);
        }

        return didSpecial ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getMarches(state, modifiers, marchResults) {
        const threatRegionIds = modifiers.context.threatRegions || [];
        const otherMarchRegionIds = _(state.regionsById).filter((region, id) => {
            const threatRegion = _.indexOf(threatRegionIds, id) >= 0;
            const noEnemyAlliesOrCitadels = !_.find(region.pieces(),
                                                    piece => (piece.type === 'alliedtribe' || piece.type === 'citadel') && piece.factionId !== FactionIDs.ROMANS);
            const hasMobileRomans = region.getMobilePiecesForFaction(FactionIDs.ROMANS).length > 0;

            return !threatRegion && region.inPlay() && noEnemyAlliesOrCitadels && hasMobileRomans;
        }).map((region, id) => region.id).value();

        const prioritizedFactions = this.getEnemyFactionPriority(state);

        const threatMarches = _.filter(marchResults, result => _.indexOf(threatRegionIds, result.region.id) >= 0);
        const otherMarches = _.filter(marchResults, result => _.indexOf(otherMarchRegionIds, result.region.id) >= 0);
        const allMarches = _.concat(threatMarches, otherMarches);

        const marchData = this.prioritizeMarchDestinations(state, allMarches, prioritizedFactions, threatRegionIds);

        if(state.romans.offMapLegions() > 5) {

            const marchToOneMarches = this.getMarchToOneMarches(state, modifiers, marchData);
            if(marchToOneMarches) {
                return marchToOneMarches;
            }
        }

        return [];

    }

    static getMarchToOneMarches(state, modifiers, marchData) {
        const allLegionsAndLeaderInMarchRegions = _.reduce(marchData, (sum, data) => {
                return sum + (data.numLegions + (data.leader ? 1 : 0));
            }, 0) === (12 - state.romans.offMapLegions()) + (state.romans.availableLeader() ? 0 : 1);

        if (!allLegionsAndLeaderInMarchRegions) {
            return [];
        }

        const requiredMarches = _.filter(marchData, data => data.numLegions > 0 || data.leader);

        if(modifiers.limited && requiredMarches.length > 1) {
            return [];
        }

        const cost = _.reduce(requiredMarches, (sum, data) => {
            return sum + data.march.cost;
        },0);

        if(!modifiers.free && state.romans.resources() < cost) {
            return [];
        }

        const possibleDestinations = _(requiredMarches).reduce((destinations, data) => {
            const marchDestinations = _.map(data.prioritizedDestinations, destData => destData.destination);
            return destinations.length === 0 ? marchDestinations :  _.intersectionBy(destinations, marchDestinations, destination => destination.id);
        }, []);

        if (possibleDestinations.length === 0) {
            return [];
        }

        const actualDestination = _.find(possibleDestinations, (destination) => {
            return _.every(requiredMarches, (data) => {
                const pieces = this.getMarchingPieces(data.march.region);
                return this.getBestDestinationPath(state, pieces, data.march.region, destination);
            });
        });

        if(!actualDestination) {
            return [];
        }

        const additionalMarches = _(marchData).reject(data => data.numLegions > 0 || data.leader).filter(data => {
            const pieces = this.getMarchingPieces(data.march.region);
            return this.getBestDestinationPath(state, pieces, data.march.region, actualDestination);
        }).value();

        const actualMarches = _(requiredMarches).concat(additionalMarches).map('march').value();

        const paidForMarches = modifiers.free ? actualMarches : _.reduce(actualMarches, (accumulator, march) => {
            if (accumulator.resourcesRemaining >= march.cost) {
                accumulator.resourcesRemaining -= march.cost;
                accumulator.marches.push(march);
            }
            return accumulator
        }, { resourcesRemaining: state.romans.resources(), marches: [] }).marches;

        _.each(paidForMarches, (march) => {
            march.targetDestination = actualDestination;
            march.pieces = this.getMarchingPieces(march.region);
        });

        return paidForMarches;

    }

    static getMarchingPieces(region) {
        const legions = region.getLegions();
        const leader = region.getLeaderForFaction(FactionIDs.ROMANS);
        const auxilia = region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);

        const controlMarginAfterInitialPieces = region.controllingMarginByFaction()[FactionIDs.ROMANS] - (legions.length + (leader ? 1: 0) + (auxilia.length > 0 ? 1 : 0));
        const numAuxiliaToMarch = controlMarginAfterInitialPieces > 0 ? Math.min(controlMarginAfterInitialPieces, auxilia.length) : auxilia.length;

        return _(legions).concat([leader], _.take(auxilia, numAuxiliaToMarch)).compact().value();
    }

    static prioritizeMarchDestinations(state, marches, prioritizedFactions, threatRegionIds) {
        const marchRegionIds = _.map(marches, march => march.region.id);
        return _(marches).map((march) => {
            const prioritizedDestinations = _(march.destinations).map(destination => {

                if (_.indexOf(marchRegionIds, destination) >= 0) {
                    return;
                }

                const priority = _(prioritizedFactions).reduce((priority, factionId, index) => {
                    if (destination.numAlliesAndCitadelsForFaction(factionId) > 0 && index < priority) {
                        return index;
                    }
                    return priority;
                }, 99);

                if (priority === 99) {
                    return;
                }

                return {
                    destination,
                    priority
                }
            }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().value();

            return {
                march,
                numLegions: march.region.getLegions().length,
                leader: march.region.getLeaderForFaction(FactionIDs.ROMANS),
                threat: _.indexOf(threatRegionIds, march.region.id) >= 0,
                prioritizedDestinations
            }
        }).value();
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

        }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map('id').value();

        if (targetGermans) {
            priorityFactions.push(FactionIDs.GERMANIC_TRIBES);
        }

        const roll = _.random(1, 6);
        if (roll < 5) {
            priorityFactions.push.apply(priorityFactions,
                                        _(state.factions).reject(faction => faction.id === FactionIDs.ROMANS).map(
                                            (faction) => {
                                                const priority = 99 - faction.numAlliedTribesAndCitadelsPlaced();
                                                return {
                                                    id: faction.id,
                                                    priority
                                                };
                                            }).sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map(
                                            'id').value());
        }
        else {
            priorityFactions.push.apply(priorityFactions,
                                        _(state.factions).reject(faction => faction.id === FactionIDs.ROMANS).map(
                                            (faction) => {
                                                const player = state.playersByFaction[faction.id];
                                                const priority = player.isNonPlayer ? 'b' : 'a';
                                                return {
                                                    id: faction.id,
                                                    priority
                                                };
                                            }).sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map(
                                            'id').value());
        }

        return _.uniq(priorityFactions);
    }

    static wasBritanniaMarch(marches) {
        return _.find(marches,
                      march => (march.region.id === RegionIDs.BRITANNIA || march.targetDestination.id === RegionIDs.BRITANNIA));
    }

    static payForMarchAndHide(state, modifiers, march, alreadyMarchedById = {}) {
        const romans = state.romans;

        if (!alreadyMarchedById[march.region.id]) {
            alreadyMarchedById[march.region.id] = true;
            if (romans.resources() < march.cost && !modifiers.free) {
                return false;
            }

            if (!modifiers.free) {
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

        const bestPath = _(Map.findPathsToRegion(state, startRegion.id, destination.id, 3)).map(
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
                    harassmentLosses
                }
            }).compact().sortBy('harassmentLosses').groupBy('harassmentLosses').map(
            _.shuffle).flatten().first();

        if (!bestPath) {
            return;
        }

        return {
            destination,
            path: bestPath.path,
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