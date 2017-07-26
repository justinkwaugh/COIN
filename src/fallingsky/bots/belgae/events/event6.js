import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import RegionGroups from 'fallingsky/config/regionGroups';
import MovePieces from 'fallingsky/actions/movePieces';
class Event6 {
    static handleEvent(state) {
        const auxiliaToMove = _(state.regions).map(region=> {
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

        let numAuxiliaToRemove = 4;
        _.each(auxiliaToMove, group => {
           const regionId = group.regionId;
           const auxilia = _.take(group.auxilia, numAuxiliaToRemove);
           numAuxiliaToRemove -= auxilia.length;

           MovePieces.execute(state, {
               sourceRegionId: regionId,
               destRegionId: RegionIDs.PROVINCIA,
               pieces: auxilia
           });

           if(numAuxiliaToRemove === 0) {
               return false;
           }
        });

        state.sequenceOfPlay.ineligibleThroughNext(FactionIDs.ROMANS);
        state.sequenceOfPlay.remainEligible(FactionIDs.BELGAE);

        return true;
    }
}

export default Event6
