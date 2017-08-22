import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import MovePieces from 'fallingsky/actions/movePieces';
class Event6 {
    static handleEvent(state) {
        if(state.romans.availableAuxilia().length === 20) {
            return false;
        }


        const legionRegionData = _(state.regions).shuffle().map(region=> {
            const hasLegions = region.getLegions().length > 0;
            const numAuxilia = region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length;

            if(!hasLegions || numAuxilia === 0) {
                return;
            }

            return {
                region,
                numAuxilia
            }
        }).compact().sortBy('numAuxilia').value();

        let numAuxiliaToRemove = 4;

        _.each(legionRegionData, regionData=> {
            if(regionData.numAuxilia > numAuxiliaToRemove) {
                return false;
            }

            const auxilia = regionData.region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
            MovePieces.execute(state, {
               sourceRegionId: regionData.region.id,
               destRegionId: RegionIDs.PROVINCIA,
               pieces: auxilia
           });

            numAuxiliaToRemove -= auxilia.length;
        });


        if(numAuxiliaToRemove > 0) {
            const auxiliaToMove = _(state.regions).map(region => {
                const auxilia = region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
                const groupedAuxilia = _.groupBy(auxilia, aux => aux.status());

                const groups = [];
                if (groupedAuxilia.hidden) {
                    groups.push({
                                    regionId: region.id,
                                    auxilia: groupedAuxilia.hidden,
                                    priority: '1'

                                });
                }

                if (groupedAuxilia.revealed) {
                    groups.push({
                                    regionId: region.id,
                                    auxilia: groupedAuxilia.revealed,
                                    priority:'2'
                                });
                }

                if (groups.length === 0) {
                    return;
                }

                return groups;
            }).compact().sortBy('priority').flatten().value();

            _.each(auxiliaToMove, group => {
                const regionId = group.regionId;
                const auxilia = _.take(group.auxilia, numAuxiliaToRemove);
                numAuxiliaToRemove -= auxilia.length;

                MovePieces.execute(state, {
                    sourceRegionId: regionId,
                    destRegionId: RegionIDs.PROVINCIA,
                    pieces: auxilia
                });

                if (numAuxiliaToRemove === 0) {
                    return false;
                }
            });
        }

        state.sequenceOfPlay.ineligibleThroughNext(FactionIDs.ROMANS);
        state.sequenceOfPlay.remainEligible(FactionIDs.ARVERNI);

        return true;
    }
}

export default Event6
