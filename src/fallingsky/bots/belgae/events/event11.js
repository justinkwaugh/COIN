import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionGroups from 'fallingsky/config/regionGroups';
import RemovePieces from 'fallingsky/actions/removePieces';
class Event11 {
    static handleEvent(state) {
        const auxiliaToRemove = _(state.regions).map(region=> {
            const auxilia = region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS);
            const groupedAuxilia = _.groupBy(auxilia, aux=>aux.status());

            const groups = [];
            if(groupedAuxilia.hidden) {
                groups.push({
                    regionId: region.id,
                    auxilia: groupedAuxilia.hidden,
                    priority: (region.group === RegionGroups.BELGICA ? 'a' : 'b') + '1'

                });
            }

            if(groupedAuxilia.revealed) {
                groups.push({
                    regionId: region.id,
                    auxilia: groupedAuxilia.revealed,
                    priority: (region.group === RegionGroups.BELGICA ? 'a' : 'b') + '2'
                });
            }

            if(groups.length === 0) {
                return;
            }

            return groups;
        }).compact().sortBy('priority').flatten().value();

        if(auxiliaToRemove.length === 0) {
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

           if(numAuxiliaToRemove === 0) {
               return false;
           }
        });

        return true;
    }
}

export default Event11
