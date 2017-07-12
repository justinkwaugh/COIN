import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import FactionIDs from '../../config/factionIds';
import RegionGroups from '../../config/regionGroups';
import RegionIDs from '../../config/regionIds';
import March from '../../commands/march';
import ArverniDevastate from './arverniDevastate';
import ArverniEntreat from './arverniEntreat';
import MovePieces from '../../actions/movePieces';
import RemovePieces from '../../actions/removePieces';
import RemoveResources from '../../actions/removeResources';
import HidePieces from '../../actions/hidePieces';
import EnemyFactionPriority from './enemyFactionPriority';
import FactionActions from '../../../common/factionActions';
import Map from '../../util/map';

class ArverniMarch {

    static march(state, modifiers, marchType, skipCondition = false) {
        if (state.frost()) {
            return false;
        }

        if (marchType === 'threat') {
            return this.threatMarch(state, modifiers);
        }
        else if (marchType === 'spread') {
            const arverni = state.arverni;
            if (!skipCondition) {
                if (arverni.numAlliedTribesAndCitadelsPlaced() >= 9 || arverni.availableWarbands().length > 6) {
                    return false;
                }
            }
            return this.spreadMarch(state, modifiers)
        }
        else {
            return this.massMarch(state, modifiers);
        }
    }

    static threatMarch(state, modifiers) {
        let effective = false;
        const arverni = state.arverni;

        const marchResults = March.test(state, {factionId: FactionIDs.ARVERNI});
        const leaderMarch = this.getLeaderMarch(marchResults);
        const remainingMarches = this.getRemainingMarches(state, marchResults, leaderMarch.targetDestination);

        if (arverni.resources() < leaderMarch.march.cost && !modifiers.free) {
            return false;
        }

        const marches = _.concat([leaderMarch], remainingMarches);
        let canDoSpecial = modifiers.canDoSpecial() && !this.wasBritanniaMarch(marches);
        let didSpecial = canDoSpecial && (ArverniDevastate.devastate(state, modifiers) || ArverniEntreat.entreat(state,
                                                                                                                 modifiers));

        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.MARCH);
        console.log('*** Arverni Marching to Escape Threat ***');
        const alreadyMarched = {};
        _.each(
            marches, (march) => {

                if (!this.payForMarchAndHide(state, modifiers, march.march, alreadyMarched)) {
                    return false;
                }

                MovePieces.execute(
                    state, {
                        sourceRegionId: march.region.id,
                        destRegionId: march.targetDestination.id,
                        pieces: march.march.mobilePieces
                    });
                effective = true;
            });

        if (!effective) {
            state.turnHistory.getCurrentTurn().rollbackCommand();
            return false;
        }
        state.turnHistory.getCurrentTurn().commitCommand();

        if (canDoSpecial && !didSpecial) {
            didSpecial = ArverniDevastate.devastate(state, modifiers) || ArverniEntreat.entreat(state, modifiers);
        }

        return didSpecial ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getLeaderMarch(marchResults) {
        const leaderMarch = _(marchResults).find(march => march.region.getLeaderForFaction(FactionIDs.ARVERNI));
        if (!leaderMarch) {
            debugger;
        }
        const leaderAdjacentRegionIds = _(leaderMarch.region.adjacent).map('id').value();
        const targetDestination = _(leaderMarch.destinations).filter(
            destination => _.indexOf(leaderAdjacentRegionIds, destination.id) >= 0).map(
            (region) => {
                const pieces = region.getPiecesForFaction(FactionIDs.ARVERNI);
                return {
                    region,
                    pieces,
                    numPieces: pieces.length
                }
            }).sortBy('numPieces').groupBy('numPieces').map(_.shuffle).flatten().first();

        return {
            march: leaderMarch,
            region: leaderMarch.region,
            targetDestination: targetDestination.region
        }
    }

    static getRemainingMarches(state, marchResults, leaderRegion) {
        return _(marchResults).reject(march => march.region.id === leaderRegion.id).reject(
            march => march.region.getLeaderForFaction(FactionIDs.ARVERNI)).map(
            (march) => {
                if (march.mobilePieces.length < 2) {
                    return;
                }

                const targetDestination = _(march.destinations).map(
                    (region) => {
                        return {
                            region,
                            distance: Map.measureDistanceToRegion(state, region.id, leaderRegion.id)
                        }
                    }).sortBy('distance').groupBy('distance').map(_.shuffle).flatten().first();

                return {
                    march,
                    region: march.region,
                    targetDestination: targetDestination.region
                }
            }).compact().value();
    }

    static wasBritanniaMarch(marches) {
        return _.find(marches,
                      march => (march.region.id === RegionIDs.BRITANNIA || march.targetDestination.id === RegionIDs.BRITANNIA));
    }

    static spreadMarch(state, modifiers) {
        let effective = false;
        const arverni = state.arverni;

        const marchResults = March.test(state, {factionId: FactionIDs.ARVERNI});
        const spreadMarches = this.getSpreadMarches(marchResults);
        const leaderMarch = this.getSpreadLeaderMarch(state, marchResults, spreadMarches);
        const marches = _.concat(spreadMarches, leaderMarch ? [leaderMarch] : []);

        if (marches.length === 0 || (!modifiers.free && arverni.resources() < _.minBy(_.map(marches, 'cost')))) {
            return false;
        }

        const alreadyMarchedById = {};
        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.MARCH);
        if (this.doSpreadMarches(state, modifiers, spreadMarches, alreadyMarchedById)) {
            effective = true;
        }

        if (this.doControlMarch(state, modifiers, leaderMarch, alreadyMarchedById)) {
            effective = true;
        }

        if (!effective) {
            state.turnHistory.getCurrentTurn().rollbackCommand();
            return false;
        }

        state.turnHistory.getCurrentTurn().commitCommand();

        let canDoSpecial = modifiers.canDoSpecial() && !this.wasBritanniaSpreadMarch(
                marches) && !this.wasBritanniaControlMarch(leaderMarch);
        const didSpecial = canDoSpecial && (ArverniDevastate.devastate(state, modifiers) || ArverniEntreat.entreat(
                state, modifiers));
        return didSpecial ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static wasBritanniaSpreadMarch(marches) {
        return _.find(marches, march => (march.region.id === RegionIDs.BRITANNIA || _.find(march.spreadDestinations,
                                                                                           {id: RegionIDs.BRITANNIA})));
    }

    static wasBritanniaControlMarch(march) {
        return march && (march.region.id === RegionIDs.BRITANNIA || march.controlDestination.id === RegionIDs.BRITANNIA);
    }

    static doSpreadMarches(state, modifiers, marches, alreadyMarchedById) {
        let effective = false;
        const arverni = state.arverni;
        console.log('*** Arverni Marching to Spread ***');
        _.each(
            marches, (march) => {
                this.payForMarchAndHide(state, modifiers, march, alreadyMarchedById);

                const warbands = march.region.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI);
                _.each(
                    march.spreadDestinations, (id) => {
                        MovePieces.execute(
                            state, {
                                sourceRegionId: march.region.id,
                                destRegionId: id,
                                pieces: [warbands.pop()]
                            });

                        if (warbands.length === 0) {
                            return false;
                        }
                    });
                effective = true;
            });
        return effective;
    }

    static doControlMarch(state, modifiers, march, alreadyMarchedById) {
        if (!march) {
            return false;
        }

        const arverni = state.arverni;
        console.log('*** Arverni Marching to Take Control ***');

        this.payForMarchAndHide(state, modifiers, march, alreadyMarchedById);

        const warbands = march.region.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI);
        const leader = march.region.getLeaderForFaction(FactionIDs.ARVERNI);
        if (march.harassmentLosses) {
            RemovePieces.execute(
                state, {
                    factionId: arverni.id,
                    regionId: march.region.id,
                    pieces: warbands.splice(0, march.harassmentLosses)
                });
        }
        MovePieces.execute(
            state, {
                sourceRegionId: march.region.id,
                destRegionId: march.controlDestination.id,
                pieces: _(warbands).take(march.numControlWarbands - march.harassmentLosses).concat([leader]).value()
            });
        return true;

    }

    static payForMarchAndHide(state, modifiers, march, alreadyMarchedById) {
        const arverni = state.arverni;

        if (!alreadyMarchedById[march.region.id]) {
            alreadyMarchedById[march.region.id] = true;
            if (arverni.resources() < march.cost && !modifiers.free) {
                return false;
            }

            if (!modifiers.free) {
                RemoveResources.execute(state, {factionId: FactionIDs.ARVERNI, count: march.cost});
            }
            HidePieces.execute(
                state, {
                    factionId: arverni.id,
                    regionId: march.region.id
                });
            return true;
        }
    }

    static getSpreadMarches(marchResults) {
        const visited = [];
        return _(marchResults).map(
            (march) => {
                const numWarbands = march.region.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length;
                if (numWarbands === 0) {
                    return;
                }
                const spreadDestinations = _(march.adjacentDestinations).filter(
                    destination => destination.getHiddenWarbandsOrAuxiliaForFaction(
                        FactionIDs.ARVERNI).length === 0).map(
                    (destination) => {
                        const numOverlaps = _.reduce(
                            marchResults, (sum, otherMarch) => {
                                if (_.find(otherMarch.adjacentDestinations,
                                           otherDestination => destination.id === otherDestination.id)) {
                                    return sum + 1;
                                }
                                return sum;
                            }, 0);

                        return {
                            id: destination.id,
                            numOverlaps
                        }
                    }).sortBy('numOverlaps').groupBy('numOverlaps').map(_.shuffle).flatten().take(numWarbands).map(
                    'id').value();

                if (spreadDestinations.length === 0) {
                    return;
                }

                march.numSpreadWarbands = Math.min(numWarbands, spreadDestinations.length);
                march.spreadDestinations = spreadDestinations;

                return march;
            }).compact().sortBy('numSpreadWarbands').reverse().map(
            (march) => {
                march.spreadDestinations = _.reject(march.spreadDestinations, id => _.indexOf(visited, id) >= 0);
                visited.push.apply(visited, march.spreadDestinations);
                march.numSpreadWarbands = Math.min(march.numSpreadWarbands, march.spreadDestinations.length);
                return march.spreadDestinations.length > 0 ? march : null;
            }).compact().value();
    }

    static getSpreadLeaderMarch(state, marchResults, spreadMarches) {
        const leaderMarch = _(spreadMarches).find(march => march.region.getLeaderForFaction(FactionIDs.ARVERNI)) || _(
                marchResults).find(march => march.region.getLeaderForFaction(FactionIDs.ARVERNI));
        if (!leaderMarch) {
            return;
        }

        // Consider the results of the spreading marches
        const spreadDestinationsById = _(spreadMarches).map('spreadDestinations').flatten().keyBy(_.identity).value();
        const alreadyMarchedWarbands = (leaderMarch.numSpreadWarbands || 0);
        const leaderRegionControlMargin = leaderMarch.region.controllingMarginByFaction()[FactionIDs.ARVERNI] - alreadyMarchedWarbands;
        const availableWarbands = leaderMarch.region.getWarbandsOrAuxiliaForFaction(
                FactionIDs.ARVERNI).length - (alreadyMarchedWarbands + 1); // Leave one behind
        if (availableWarbands < 0) {
            return;
        }

        if (leaderRegionControlMargin === 1) {
            return;
        }

        // Figure out how many we can actually march considering control
        const numWarbandsToMarch = leaderRegionControlMargin < 1 ? availableWarbands : leaderRegionControlMargin - 2;
        const numMarching = numWarbandsToMarch + 1;
        // Find best path to all destinations considering harassment
        const destinationPathsById = _.keyBy(
            this.getDestinationPaths(state, numMarching, leaderMarch.region, leaderMarch.destinations), 'id');
        const destinationToControl = _(leaderMarch.destinations).reject({id: RegionIDs.AEDUI}).filter(
            destination => destinationPathsById[destination.id]).filter(
            (destination) => {
                // See if we can take control from Romans or Aedui even after harassment
                const numAfterHarassment = numMarching - destinationPathsById[destination.id].bestPath.harassmentLosses;
                const spreadWarbands = spreadDestinationsById[destination.id] ? 1 : 0;
                const canTakeControl = destination.controllingMarginByFaction()[FactionIDs.ARVERNI] + spreadWarbands + numAfterHarassment > 0;
                const isEnemyControlled = destination.controllingFactionId() === FactionIDs.AEDUI || destination.controllingFactionId() === FactionIDs.ROMANS;
                return canTakeControl && isEnemyControlled;
            }).map(
            (destination) => {
                // Now figure out the priority based on harassment and adjacent regions with arverni present
                const numAdjacentRegionsWithArverni = _.reduce(
                    destination.adjacent, (sum, adjacent) => {
                        if (adjacent.getPiecesForFaction(
                                FactionIDs.ARVERNI).length > 0 || spreadDestinationsById[adjacent.id]) {
                            return sum + 1;
                        }
                        return sum;
                    }, 0);
                const numHarassmentLosses = destinationPathsById[destination.id].bestPath.harassmentLosses;
                return {
                    destination,
                    numHarassmentLosses,
                    priority: (10 + numHarassmentLosses) + '-' + (99 - numAdjacentRegionsWithArverni)
                }
            }).sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();

        if (!destinationToControl) {
            return;
        }

        leaderMarch.numControlWarbands = numWarbandsToMarch;
        leaderMarch.controlDestination = destinationToControl.destination;
        leaderMarch.harassmentLosses = destinationToControl.numHarassmentLosses;

        return leaderMarch;

    }

    static getDestinationPaths(state, numMobile, startRegion, destinations) {
        return _(destinations).map(
            (destination) => {
                const distance = Map.measureDistanceToRegion(state, startRegion.id, destination.id);
                if (distance < 2) {
                    return {
                        id: destination.id,
                        destination,
                        bestPath: {
                            path: [startRegion.id, destination.id],
                            harassmentLosses: 0
                        }
                    };
                }

                const bestPath = _(Map.findPathsToRegion(state, startRegion.id, destination.id, 2)).map(
                    (path) => {
                        const middleRegion = state.regionsById[path[1]];
                        const harassmentLosses = this.harassmentLosses(state, FactionIDs.ROMANS, middleRegion) +
                                                 this.harassmentLosses(state, FactionIDs.BELGAE, middleRegion) +
                                                 this.harassmentLosses(state, FactionIDs.AEDUI, middleRegion) +
                                                 this.harassmentLosses(state, FactionIDs.GERMANIC_TRIBES, middleRegion);

                        if (harassmentLosses > 3 || harassmentLosses >= numMobile) {
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
                    id: destination.id,
                    destination,
                    bestPath
                }

            }).compact().value();
    }

    static harassmentLosses(state, factionId, region) {
        let losses = 0;
        const numHiddenEnemies = region.getHiddenPiecesForFaction(factionId).length;
        if (numHiddenEnemies >= 3) {
            const player = state.playersByFaction[factionId];
            if (player.willHarass(FactionIDs.ARVERNI)) {
                losses = Math.floor(numHiddenEnemies / 3);
            }
        }
        return losses;
    }

    static massMarch(state, modifiers) {
        let effective = false;

        const marchResults = March.test(state, {factionId: FactionIDs.ARVERNI});
        const leaderMarch = _(marchResults).find(march => march.region.getLeaderForFaction(FactionIDs.ARVERNI));
        if (!leaderMarch) {
            return false;
        }

        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.MARCH);
        const legionControlMarch = this.getLegionControlMarch(state, modifiers, leaderMarch, marchResults);
        if (legionControlMarch) {
            effective = this.doControlMarch(state, modifiers, legionControlMarch, {});
        }
        else {
            const massMarches = this.getMassMarches(state, modifiers, leaderMarch, marchResults);
            effective = this.doMassMarches(state, modifiers, massMarches);
        }
        if (!effective) {
            state.turnHistory.getCurrentTurn().rollbackCommand();
            return false;
        }

        state.turnHistory.getCurrentTurn().commitCommand();
        let canDoSpecial = modifiers.canDoSpecial() && !this.wasBritanniaControlMarch(legionControlMarch);
        const didSpecial = canDoSpecial && (ArverniDevastate.devastate(state, modifiers) || ArverniEntreat.entreat(
                state, modifiers));
        return didSpecial ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static doMassMarches(state, modifiers, marches) {
        let effective = false;
        _.each(
            marches, (march, index) => {
                if (!this.payForMarchAndHide(state, modifiers, march, {})) {
                    return false;
                }
                if (index === 0) {
                    console.log('*** Arverni March to mass near legion');
                }
                const pieces = _.take(march.region.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI),
                                      march.numMassWarbands);
                const leader = march.region.getLeaderForFaction(FactionIDs.ARVERNI);
                if (leader) {
                    pieces.unshift(leader);
                }
                MovePieces.execute(
                    state, {
                        sourceRegionId: march.region.id,
                        destRegionId: march.massDestination.id,
                        pieces: pieces
                    });
                effective = true;
            });
        return effective;
    }

    static getLegionControlMarch(state, modifiers, leaderMarch, marchResults) {

        const availableWarbands = leaderMarch.region.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length;
        const numMarching = availableWarbands + 1;

        const destinationPathsById = _.keyBy(
            this.getDestinationPaths(state, numMarching, leaderMarch.region, leaderMarch.destinations), 'id');
        const destinationToControl = _(leaderMarch.destinations).filter(
            destination => destinationPathsById[destination.id]).filter(
            (destination) => {
                // Can't already be controlled by Arverni
                if (destination.controllingFactionId() === FactionIDs.ARVERNI) {
                    return false;
                }

                // Has to have a legion
                const romanMobilePieces = destination.getMobilePiecesForFaction(FactionIDs.ROMANS);
                const hasLegion = _.find(romanMobilePieces, {type: 'legion'});
                if (!hasLegion) {
                    return false;
                }

                // We need more than 2x the number of roman mobile pieces
                const numAfterHarassment = numMarching - destinationPathsById[destination.id].bestPath.harassmentLosses;
                const numAfterMarch = destination.getMobilePiecesForFaction(
                        FactionIDs.ARVERNI).length + numAfterHarassment;
                const hasCaesar = _.find(romanMobilePieces, piece => piece.type === 'leader' && !piece.isSuccessor());
                if (hasCaesar && (numAfterMarch <= romanMobilePieces.length * 2)) {
                    return false;
                }

                // Finally we need to control
                const canTakeControl = destination.controllingMarginByFaction()[FactionIDs.ARVERNI] + numAfterHarassment > 0;
                return canTakeControl;
            }).map(
            (destination) => {
                // Now figure out the priority based on harassment
                const numHarassmentLosses = destinationPathsById[destination.id].bestPath.harassmentLosses;
                return {
                    destination,
                    numHarassmentLosses
                }
            }).sortBy('numHarassmentLosses').groupBy('numHarassmentLosses').map(_.shuffle).flatten().first();

        if (!destinationToControl) {
            return;
        }


        leaderMarch.numControlWarbands = availableWarbands;
        leaderMarch.controlDestination = destinationToControl.destination;
        leaderMarch.harassmentLosses = destinationToControl.numHarassmentLosses;

        return leaderMarch;
    }

    static getMassMarches(state, modifiers, leaderMarch, marchResults) {

        const availableWarbands = leaderMarch.region.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length;
        if (availableWarbands.length < 1) {
            return [];
        }

        const numMarching = availableWarbands; // + leader, - one left behind;

        const marchResultsByRegionId = _.keyBy(marchResults, march => march.region.id);
        const destinationPathsById = _.keyBy(
            this.getDestinationPaths(state, numMarching, leaderMarch.region, leaderMarch.destinations), 'id');

        // Find destinations that the leader can march to which are next to a legion
        const destinationsNextToLegion = _(leaderMarch.destinations).filter(
            destination => destinationPathsById[destination.id]).filter(
            (destination) => {
                if (destination.getLegions().length > 0) {
                    return false;
                }
                const numAfterHarassment = numMarching - destinationPathsById[destination.id].bestPath.harassmentLosses;
                if (numAfterHarassment === 0) {
                    return false;
                }
                return _.find(destination.adjacent, adjacent => adjacent.getLegions().length > 0);
            }).value();

        if (destinationsNextToLegion.length === 0) {
            return [];
        }

        // Now pick the one which can be marched to by the most warbands (aside from the leader's march)
        const chosenMassResults = _(destinationsNextToLegion).map((destination) => {
            const massResults = this.calculateMassResultsForDestination(state, leaderMarch, marchResultsByRegionId,
                                                                        destination);
            return {
                destination,
                numToMass: massResults.numToMass,
                massResults,
                priority: 99 - massResults.numToMass + '-' + 10 + massResults.marches.length
            }
        }).sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();

        if (!chosenMassResults) {
            return;
        }

        leaderMarch.numMassWarbands = availableWarbands - 1;
        leaderMarch.massDestination = chosenMassResults.destination;
        leaderMarch.harassmentLosses = destinationPathsById[chosenMassResults.destination.id].bestPath.harassmentLosses;

        const leaderAlreadyAdjacentToLegion = _.find(leaderMarch.region.adjacent,
                                                     adjacent => adjacent.getLegions().length > 0);
        const marchMassTotal = (leaderMarch.numMassWarbands - leaderMarch.harassmentLosses) + chosenMassResults.numToMass;
        if (leaderAlreadyAdjacentToLegion && marchMassTotal <= leaderMarch.region.getPiecesForFaction(
                FactionIDs.ARVERNI)) {
            return [];
        }

        const massMarches = chosenMassResults.massResults.marches;
        _.each(massMarches, (march) => {
            march.massDestination = chosenMassResults.destination;
        });

        massMarches.unshift(leaderMarch);
        return massMarches;
    }

    static calculateMassResultsForDestination(state, leaderMarch, marchResultsByRegionId, destination) {
        const arverni = state.arverni;
        const arverniPiecesAtDestination = destination.getPiecesForFaction(FactionIDs.ARVERNI).length;
        return _(destination.adjacent).reject(region => region.id === leaderMarch.region.id).map((region) => {
            return {
                region,
                numWarbands: region.getWarbandsOrAuxiliaForFaction(FactionIDs.ARVERNI).length
            }
        }).filter(regionData => regionData.numWarbands > 1).sortBy('numWarbands').reverse().reduce(
            (accumulator, regionData) => {
                const cost = marchResultsByRegionId[regionData.region.id].cost;
                if (cost < accumulator.resources) {
                    const march = marchResultsByRegionId[regionData.region.id];
                    march.numMassWarbands = regionData.numWarbands - 1;

                    accumulator.resources -= cost;
                    accumulator.numToMass += march.numMassWarbands;
                    accumulator.marches.push(march);
                }
                return accumulator;
            }, {resources: arverni.resources() - leaderMarch.cost, numToMass: arverniPiecesAtDestination, marches: []});
    }

}

export default ArverniMarch