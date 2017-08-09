import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import FactionIDs from '../../config/factionIds';
import RegionGroups from '../../config/regionGroups';
import RegionIDs from '../../config/regionIds';
import March from '../../commands/march';
import BelgaeEnlist from './belgaeEnlist';
import MovePieces from '../../actions/movePieces';
import HidePieces from '../../actions/hidePieces';
import EnemyFactionPriority from './enemyFactionPriority';
import FactionActions from '../../../common/factionActions';
import RemoveResources from '../../actions/removeResources';
import Map from '../../util/map';

class BelgaeMarch {

    static march(state, modifiers) {

        if (state.frost()) {
            return false;
        }

        if (modifiers.context.threatRegions) {
            return this.threatMarch(state, modifiers);
        }
        else {
            return this.controlMarch(state, modifiers);
        }
    }

    static threatMarch(state, modifiers) {
        const belgae = state.belgae;
        const threatRegions = modifiers.context.threatRegions;
        let marchResults = _.filter(March.test(state, {factionId: FactionIDs.BELGAE}),
                                    march => _.indexOf(modifiers.allowedRegions, march.region.id) >= 0);

        const largestBelgaeGroup = _.reduce(
            state.regions, (largest, region) => {
                const numBelgaeForRegion = (region.piecesByFaction()[FactionIDs.BELGAE] || []).length;
                if (numBelgaeForRegion > largest.numBelgae) {
                    largest.numBelgae = numBelgaeForRegion;
                    largest.region = region;
                }
                return largest;
            }, {region: null, numBelgae: 0});

        const necessaryMarches = _(marchResults).filter(
            marchResult => (belgae.resources() >= marchResult.cost) || modifiers.free).filter(
            (marchResult) => {
                if (_.indexOf(threatRegions, marchResult.region.id) >= 0) {
                    return true;
                }
                const leader = marchResult.region.getLeaderForFaction(FactionIDs.BELGAE);
                const numBelgaeForRegion = (marchResult.region.piecesByFaction()[FactionIDs.BELGAE] || []).length;
                return leader && numBelgaeForRegion < largestBelgaeGroup.numBelgae;
            }).sortBy(marchResult => marchResult.region.getLeaderForFaction(FactionIDs.BELGAE) ? 'a' : 'b').value();

        const marchFromRegions = _(necessaryMarches).map(march => march.region).value();
        const solutions = Map.findMinimumAdjacent(marchFromRegions, modifiers.context.allowedDestRegions);

        let effective = false;
        let wasBritannia = false;
        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.MARCH);
        _.each(
            necessaryMarches, (march) => {
                if (belgae.resources() < march.cost && !modifiers.free) {
                    return false;
                }

                if (!modifiers.free) {
                    RemoveResources.execute(state, {factionId: FactionIDs.BELGAE, count: march.cost});
                }

                const destination = _(solutions).map(
                    (arr) => {
                        let adjacentRegionsById = _.keyBy(march.region.adjacent, 'id');
                        if(modifiers.context.allowedDestRegions) {
                            adjacentRegionsById = _.filter(adjacentRegionsById, (region, id)=>_.indexOf(modifiers.context.allowedDestRegions, id) >= 0);
                        }
                        const solutionDestination = _.find(arr, solution => adjacentRegionsById[solution.id]);
                        if(!solutionDestination) {
                            return;
                        }

                        const region = state.regionsById[solutionDestination.id];
                        const numBelgaeForRegion = (region.piecesByFaction()[FactionIDs.BELGAE] || []).length;
                        const numAdjacentWithBelgic = _(region.adjacent).reject(
                            adjacentRegion => adjacentRegion.id === region.id).reduce(
                            (sum, adjacentRegion) => {
                                if (adjacentRegion.piecesByFaction()[FactionIDs.BELGAE]) {
                                    return sum + 1;
                                }
                                return sum;
                            });

                        const priority = 'a' + (99 - numBelgaeForRegion) + '-' + (99 - numAdjacentWithBelgic);
                        return {
                            region,
                            numPieces: numBelgaeForRegion,
                            numAdjacentWithBelgic: numAdjacentWithBelgic,
                            priority
                        }
                    }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();

                if(!destination) {
                    return;
                }

                const piecesToMove = march.region.getMobilePiecesForFaction(FactionIDs.BELGAE);

                HidePieces.execute(state, {
                    factionId: belgae.id,
                    regionId: march.region.id
                });

                MovePieces.execute(
                    state, {
                        sourceRegionId: march.region.id,
                        destRegionId: destination.region.id,
                        pieces: piecesToMove
                    });
                if (destination.region.id === RegionIDs.BRITANNIA || march.region.id === RegionIDs.BRITANNIA) {
                    wasBritannia = true;
                }
                effective = true;

                if (modifiers.limited) {
                    return false;
                }
            });

        if (!effective) {
            state.turnHistory.getCurrentTurn().rollbackCommand();
            return false;
        }
        else {
            state.turnHistory.getCurrentTurn().commitCommand();
        }
        const usedSpecialAbility = modifiers.canDoSpecial() && !wasBritannia && (BelgaeEnlist.enlist(state, modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static controlMarch(state, modifiers) {
        const belgae = state.belgae;

        let marchResults = _.filter(March.test(state, {factionId: FactionIDs.BELGAE}),
                                    marchResult => ((belgae.resources() >= marchResult.cost) || modifiers.free) && _.indexOf(
                                        modifiers.allowedRegions, marchResult.region.id) >= 0);

        if (modifiers.context.monsCevenna) {
            const provincia = state.regionsById[RegionIDs.PROVINCIA];
            const marchRegions = _.clone(provincia.adjacent);
            marchRegions.push(provincia);
            const marchRegionIds = _.map(marchRegions, 'id');

            marchResults = _.filter(marchResults, marchResult => _.indexOf(marchRegionIds,
                                                                           marchResult.region.id) >= 0);

            _.each(marchResults, marchResult => {
                marchResult.destinations = _.filter(marchResult.destinations,
                                                    destination => _.indexOf(marchRegionIds,
                                                                             destination.id) >= 0);

            });
        }

        if(modifiers.context.allowedDestRegions) {
            _.each(marchResults, marchResult => {
                marchResult.destinations = _.filter(marchResult.destinations,
                                                    destination => _.indexOf(modifiers.context.allowedDestRegions,
                                                                             destination.id) >= 0);
            });
        }

        const firstControlMarch = this.getControlMarch(state, modifiers, marchResults);
        let secondControlMarch = null;

        let effective = false;
        let marchedFromRegions = [];
        let marchedToRegions = [];

        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.MARCH);
        if (firstControlMarch) {
            marchedFromRegions.push(firstControlMarch.region.id);
            marchedToRegions.push(firstControlMarch.destination.id);
            this.doMarch(state, firstControlMarch, modifiers);
            const secondControlMarch = this.getControlMarch(state, modifiers, _.reject(marchResults,
                                                                                       march => march.region.id === firstControlMarch.region.id));
            if (!modifiers.limited && !modifiers.context.monsCevenna && secondControlMarch) {
                marchedFromRegions.push(secondControlMarch.region.id);
                marchedToRegions.push(secondControlMarch.destination.id);
                this.doMarch(state, secondControlMarch, modifiers);
            }
            effective = true;
        }

        if ((!firstControlMarch || !modifiers.context.monsCevenna) && !modifiers.limited && this.doLeaderMarch(state,
                                                                                                               modifiers,
                                                                                                               marchedFromRegions,
                                                                                                               marchedToRegions)) {
            effective = true;
        }


        if (!effective) {
            state.turnHistory.getCurrentTurn().rollbackCommand();
            return;
        }

        state.turnHistory.getCurrentTurn().commitCommand();

        const wasBritanniaMarch = (firstControlMarch && (firstControlMarch.region.id === RegionIDs.BRITANNIA || firstControlMarch.destination.id === RegionIDs.BRITANNIA)) ||
                                  (secondControlMarch && (secondControlMarch.region.id === RegionIDs.BRITANNIA || secondControlMarch.destination.id === RegionIDs.BRITANNIA))

        const usedSpecialAbility = modifiers.canDoSpecial() && !wasBritanniaMarch && (BelgaeEnlist.enlist(state,
                                                                                                          modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static doMarch(state, marchData, modifiers) {
        console.log('*** Belgae march to control region ' + marchData.destination.name + ' ***');
        const belgae = state.belgae;
        if (!modifiers.free) {
            RemoveResources.execute(state, {factionId: FactionIDs.BELGAE, count: marchData.cost});
        }

        const warbands = _.filter(marchData.region.getMobilePiecesForFaction(FactionIDs.BELGAE), {type: "warband"});

        HidePieces.execute(
            state, {
                factionId: belgae.id,
                regionId: marchData.region.id
            });

        const numPiecesToMove = marchData.destination.group === RegionGroups.BELGICA ? marchData.numMoveableWarbands : marchData.numNeededForControl;
        const piecesToMove = _.take(warbands, numPiecesToMove);
        if (modifiers.context.monsCevenna) {
            modifiers.context.marchDestination = marchData.destination.id;
        }

        HidePieces.execute(state, {
            factionId: belgae.id,
            regionId: marchData.region.id
        });

        MovePieces.execute(
            state, {
                sourceRegionId: marchData.region.id,
                destRegionId: marchData.destination.id,
                pieces: piecesToMove
            });
    }


    static getControlMarch(state, modifiers, marchResults) {
        return _(marchResults).map(
            (march) => {
                const belgicWarbands = _.filter(march.mobilePieces, {type: 'warband'});

                if (!modifiers.free && march.cost > state.belgae.resources()) {
                    return;
                }

                // Leave one and keep control
                const regionControlMargin = march.region.controllingMarginByFaction()[FactionIDs.BELGAE];
                if (belgicWarbands.length <= 1 || regionControlMargin === 1) {
                    return;
                }

                let numMoveableWarbands = belgicWarbands.length - 1;
                if (regionControlMargin > 0) {
                    numMoveableWarbands = Math.min(numMoveableWarbands, regionControlMargin - 1);
                }

                const destinationData = _(march.destinations).map(
                    (destination) => {
                        const numNeededForControl = 1 - destination.controllingMarginByFaction()[FactionIDs.BELGAE];
                        if (numNeededForControl <= 0 || numNeededForControl > numMoveableWarbands) {
                            return;
                        }

                        let priority = (destination.group === RegionGroups.BELGICA ? 'a' : 'b') + (10 + numNeededForControl);
                        return {
                            destination,
                            numNeededForControl: numNeededForControl,
                            priority
                        };
                    }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();

                if (destinationData) {
                    return {
                        cost: march.cost,
                        region: march.region,
                        destination: destinationData.destination,
                        numMoveableWarbands: numMoveableWarbands,
                        numNeededForControl: destinationData.numNeededForControl,
                        priority: destinationData.priority
                    }
                }
            }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();
    }

    static doLeaderMarch(state, modifiers, marchedFromRegions, marchedToRegions) {
        const belgae = state.belgae;
        let marchResults = _.filter(
            March.test(state, {factionId: FactionIDs.BELGAE}),
            marchResult => ((belgae.resources() >= marchResult.cost) ||
                            modifiers.free ||
                            _.indexOf(marchedFromRegions, marchResult.region.id) >= 0) &&
                           _.indexOf(modifiers.allowedRegions, marchResult.region.id) >= 0);

        if (modifiers.context.monsCevenna) {
            const provincia = state.regionsById[RegionIDs.PROVINCIA];
            const marchRegions = _.clone(provincia.adjacent);
            marchRegions.push(provincia);
            const marchRegionIds = _.map(marchRegions, 'id');

            marchResults = _.filter(marchResults, marchResult => _.indexOf(marchRegionIds,
                                                                           marchResult.region.id) >= 0);

            _.each(marchResults, marchResult => {
                marchResult.destinations = _.filter(marchResult.destinations,
                                                    destination => _.indexOf(marchRegionIds,
                                                                             destination.id) >= 0);

            });
        }

        if(modifiers.context.allowedDestRegions) {
            _.each(marchResults, marchResult => {
                marchResult.destinations = _.filter(marchResult.destinations,
                                                    destination => _.indexOf(modifiers.context.allowedDestRegions,
                                                                             destination.id) >= 0);
            });
        }

        const leaderMarch = _.find(marchResults, result => _.find(result.region.piecesByFaction()[FactionIDs.BELGAE],
                                                                  {type: 'leader'}));
        if (!leaderMarch) {
            return;
        }
        const startBelgaePieces = leaderMarch.region.piecesByFaction()[FactionIDs.BELGAE];
        const numBelgaePiecesInStartRegion = startBelgaePieces.length - 1;
        const leader = _.find(startBelgaePieces, {type: 'leader'});

        const destinationData = _(leaderMarch.destinations).map(
            (destination) => {
                const destBelgaePieces = destination.piecesByFaction()[FactionIDs.BELGAE] || [];
                const numBelgaePiecesInDestRegion = destBelgaePieces.length;

                if (numBelgaePiecesInDestRegion <= numBelgaePiecesInStartRegion) {
                    return;
                }

                const destWarbands = _.filter(destBelgaePieces, {type: 'warband'});

                let priority = 'z';
                if (_.indexOf(marchedToRegions, destination.id) >= 0) {
                    priority = 'a' + 99 - numBelgaePiecesInDestRegion;
                }
                else if (destWarbands.length > 3) {
                    priority = 'b' + 99 - destWarbands;
                }
                else {
                    return;
                }

                return {
                    destination,
                    priority
                };
            }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();

        if (destinationData) {
            console.log(
                '*** Belgae leader marches to join pieces in region ' + destinationData.destination.name + ' ***');
            if (modifiers.context.monsCevenna) {
                modifiers.context.marchDestination = destinationData.destination.id;
            }

            HidePieces.execute(state, {
                factionId: belgae.id,
                regionId: leaderMarch.region.id
            });

            MovePieces.execute(
                state, {
                    sourceRegionId: leaderMarch.region.id,
                    destRegionId: destinationData.destination.id,
                    pieces: [leader]
                });
            return true;
        }


    }


}

export default BelgaeMarch;