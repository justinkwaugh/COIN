import _ from 'lib/lodash'
import FactionIDs from 'fallingsky/config/factionIds';
import RemovePieces from 'fallingsky/actions/removePieces';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';

class Event37 {
    static handleEvent(state) {
        let effective = false;

        const allies = _(state.regions).filter(region => {
            if (region.controllingFactionId() === FactionIDs.ARVERNI) {
                return true;
            }
            return _.find(region.adjacent, adjacent => adjacent.controllingFactionId() === FactionIDs.ARVERNI);
        }).map(region => {
            const aeduiAllies = region.getAlliesForFaction(FactionIDs.AEDUI);
            return _.map(aeduiAllies, ally => {
                return {
                    ally,
                    regionId: region.id,
                    tribeId: ally.tribeId,
                    priority: state.tribesById[ally.tribeId].isCity ? 'a' : 'b'
                }
            });
        }).flatten().compact().shuffle().sortBy('priority').take(2).value();

        _.each(allies, allyData => {
            RemovePieces.execute(state, {
                factionId: FactionIDs.AEDUI,
                regionId: allyData.regionId,
                pieces: [allyData.ally]
            });

            if (state.arverni.hasAvailableAlliedTribe()) {
                PlaceAlliedTribe.execute(state, {
                    factionId: FactionIDs.ARVERNI,
                    regionId: allyData.regionId,
                    tribeId: allyData.tribeId
                });
            }
            effective = true;
        });

        return effective;
    }
}

export default Event37
