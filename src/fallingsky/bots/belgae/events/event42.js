import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionGroups from 'fallingsky/config/regionGroups';
import RemovePieces from 'fallingsky/actions/removePieces';

class Event42 {
    static handleEvent(state) {
        const targetAllies = _(state.regions).map(region=> {
            if(!region.hasValidSupplyLine(FactionIDs.ROMANS, [FactionIDs.AEDUI])) {
                return;
            }

            const romanAllies = region.getAlliesForFaction(FactionIDs.ROMANS);
            const aeduiAllies = region.getAlliesForFaction(FactionIDs.AEDUI);

            if(romanAllies.length === 0 && aeduiAllies.length === 0) {
                return;
            }

            return _(romanAllies).concat(aeduiAllies).map( ally => {
                return {
                    region,
                    ally,
                    priority: (region.group === RegionGroups.BELGICA ? 'a' : 'b') + (ally.factionId === FactionIDs.ROMANS ? '1': '2')
                };
            }).value();

        }).compact().flatten().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().take(3).value();

        if(targetAllies.length === 0) {
            return false;
        }

        _.each(targetAllies, targetAlly => {
           RemovePieces.execute(state, {
                    factionId: targetAlly.ally.factionId,
                    regionId: targetAlly.region.id,
                    pieces: [targetAlly.ally]
                });

        });


        return true;
    }

}

export default Event42
