import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RemovePieces from 'fallingsky/actions/removePieces';
class Event11 {
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
            RemovePieces.execute(state, {
               factionId: FactionIDs.ROMANS,
               regionId: regionData.region.id,
               pieces: auxilia
           });

            numAuxiliaToRemove -= auxilia.length;
        });


        if(numAuxiliaToRemove > 0) {

            const auxiliaToRemove = _(state.regions).map(region => {
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
                                    priority: '2'
                                });
                }

                if (groups.length === 0) {
                    return;
                }

                return groups;
            }).compact().sortBy('priority').flatten().value();

            if (auxiliaToRemove.length === 0) {
                return false;
            }

            let numAuxiliaToRemove = 4;
            _.each(auxiliaToRemove, group => {
                const regionId = group.regionId;
                const auxilia = _.take(group.auxilia, numAuxiliaToRemove);
                numAuxiliaToRemove -= auxilia.length;

                RemovePieces.execute(state, {
                    factionId: FactionIDs.ROMANS,
                    regionId: regionId,
                    pieces: auxilia
                });

                if (numAuxiliaToRemove === 0) {
                    return false;
                }
            });
        }

        return true;
    }
}

export default Event11
