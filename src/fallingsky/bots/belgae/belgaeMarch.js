import _ from '../../../lib/lodash';
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

        if (modifiers.commandSpecific.threatRegions) {
            return this.threatMarch(state, modifiers);
        }
        else {
            return this.controlMarch(state, modifiers);
        }
    }

    static threatMarch(state, modifiers) {
        const belgae = state.belgae;
        const threatRegions = modifiers.commandSpecific.threatRegions;
        const marchResults = March.test(state, {factionId: FactionIDs.BELGAE});
        const largestBelgaeGroup = _.reduce(
            state.regions, (largest, region) => {
                const numBelgaeForRegion = (region.piecesByFaction()[FactionIDs.BELGAE] || []).length;
                if (numBelgaeForRegion > largest.numBelgae) {
                    largest.numBelgae = numBelgaeForRegion;
                    largest.region = region;
                }
                return largest;
            }, {region: null, numBelgae: 0});

        const necessaryMarches = _(marchResults).filter(marchResult => (belgae.resources() >= marchResult.cost) || modifiers.free).filter(
            (marchResult) => {
                if (_.indexOf(threatRegions, marchResult.region.id) >= 0) {
                    return true;
                }
                const leader = marchResult.region.getLeaderForFaction(FactionIDs.BELGAE);
                const numBelgaeForRegion = (marchResult.region.piecesByFaction()[FactionIDs.BELGAE] || []).length;
                return leader && numBelgaeForRegion < largestBelgaeGroup.numBelgae;
            }).sortBy(marchResult => marchResult.region.getLeaderForFaction(FactionIDs.BELGAE) ? 'a' : 'b').value();

        const marchFromRegions = _(necessaryMarches).map(march => march.region).value();
        const solutions = Map.findMinimumAdjacent(marchFromRegions);

        let effective = false;
        let wasBritannia = false;
        _.each(
            necessaryMarches, (march) => {
                if (belgae.resources() < march.cost && !modifiers.free) {
                    return false;
                }

                if(!modifiers.free) {
                    RemoveResources.execute(state, { factionId: FactionIDs.BELGAE, count: march.cost});
                }
                const destination = _(solutions).map(
                    (arr) => {
                        const adjacentRegionsById = _.keyBy(march.region.adjacent, 'id');
                        const solutionDestination = _.find(arr, solution => adjacentRegionsById[solution.id]);
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

                        const priority = 'a' + (99-numBelgaeForRegion) + '-' + (99-numAdjacentWithBelgic);
                        return {
                            region,
                            numPieces: numBelgaeForRegion,
                            numAdjacentWithBelgic: numAdjacentWithBelgic,
                            priority
                        }
                    }).sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();

                const piecesToMove = march.region.getMobilePiecesForFaction(FactionIDs.BELGAE);
                MovePieces.execute(
                    state, {
                        sourceRegionId: march.region.id,
                        destRegionId: destination.region.id,
                        pieces: piecesToMove
                    });
                if(destination.region.id === RegionIDs.BRITANNIA || march.region.id === RegionIDs.BRITANNIA) {
                    wasBritannia = true;
                }
                effective = true;

            });

        if(!effective) {
            return false;
        }
        const usedSpecialAbility = modifiers.canDoSpecial() && !wasBritannia && (BelgaeEnlist.enlist(state, modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static controlMarch(state, modifiers) {
        const belgae = state.belgae;
        const marchResults = _.filter(March.test(state, {factionId: FactionIDs.BELGAE}), marchResult => (belgae.resources() >= marchResult.cost) || modifiers.free);
        const firstControlMarch = this.getControlMarch(state, modifiers, marchResults);
        let secondControlMarch = null;

        let effective = false;
        if (firstControlMarch) {
            let marchedFromRegions = [firstControlMarch.region.id];
            let marchedToRegions = [firstControlMarch.destination.id];

            this.doMarch(state, firstControlMarch, modifiers);

            const secondControlMarch = this.getControlMarch(state, modifiers, _.reject(marchResults, march => march.region.id === firstControlMarch.region.id));
            if (secondControlMarch) {
                marchedFromRegions.push(secondControlMarch.region.id);
                marchedToRegions.push(secondControlMarch.destination.id);
                this.doMarch(state, secondControlMarch, modifiers);
            }

            this.doLeaderMarch(state, modifiers, marchedFromRegions, marchedToRegions);
            effective = true;
        }

        if (!effective) {
            return;
        }

        const wasBritanniaMarch = (firstControlMarch && (firstControlMarch.region.id === RegionIDs.BRITANNIA || firstControlMarch.destination.id === RegionIDs.BRITANNIA)) ||
                                  (secondControlMarch && (secondControlMarch.region.id === RegionIDs.BRITANNIA || secondControlMarch.destination.id === RegionIDs.BRITANNIA))

        const usedSpecialAbility = modifiers.canDoSpecial() && !wasBritanniaMarch && (BelgaeEnlist.enlist(state, modifiers));
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static doMarch(state, marchData, modifiers) {
        console.log('*** Belgae march to control region ' + marchData.destination.name + ' ***');
        const belgae = state.belgae;
        if (!modifiers.free) {
            RemoveResources.execute(state, { factionId: FactionIDs.BELGAE, count: marchData.cost});
        }

        const warbands = _.filter(marchData.region.getMobilePiecesForFaction(FactionIDs.BELGAE), {type: "warband"});

        HidePieces.execute(
            state, {
                factionId: belgae.id,
                regionId: marchData.region.id
            });

        const numPiecesToMove = marchData.destination.group === RegionGroups.BELGICA ? marchData.numMoveableWarbands : marchData.numNeededForControl;
        const piecesToMove = _.take(warbands, numPiecesToMove);
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
        const marchResults = _.filter(
            March.test(state, {factionId: FactionIDs.BELGAE}),
            marchResult => (belgae.resources() >= marchResult.cost) || modifiers.free || _.indexOf(marchedFromRegions, marchResult.region.id) >= 0);

        const leaderMarch = _.find(marchResults, result => _.find(result.region.piecesByFaction()[FactionIDs.BELGAE], {type: 'leader'}));
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
            console.log('*** Belgae leader marches to join pieces in region ' + destinationData.destination.name + ' ***');
            MovePieces.execute(
                state, {
                    sourceRegionId: leaderMarch.region.id,
                    destRegionId: destinationData.destination.id,
                    pieces: [leader]
                });
        }
    }


}

export default BelgaeMarch;