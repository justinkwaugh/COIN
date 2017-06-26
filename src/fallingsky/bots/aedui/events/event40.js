import _ from '../../../../lib/lodash';
import FactionIDs from '../../../config/factionIds';
import RegionIDs from '../../../config/regionIds';
import PlaceAlliedTribe from '../../../actions/placeAlliedTribe';
import PlaceWarbands from '../../../actions/placeWarbands';
import PlaceAuxilia from '../../../actions/placeAuxilia';

class Event40 {
    static handleEvent(state) {
        const aeduiFaction = state.factionsById[FactionIDs.AEDUI];
        const romanFaction = state.factionsById[FactionIDs.ROMANS];

        let effective = false;

        const cisalpinaAdjacentById = _.keyBy(state.regionsById[RegionIDs.CISALPINA].adjacent, 'id');

        const regionsCanPlaceAlly = _.filter(cisalpinaAdjacentById, function(region) {
            return region.subduedTribesForFaction(FactionIDs.AEDUI).length > 0;
        });

        const numAlliesToPlace = Math.min(aeduiFaction.availableAlliedTribes().length, regionsCanPlaceAlly.length);
        _.each(_.sampleSize(regionsCanPlaceAlly, numAlliesToPlace), function(region) {
            const subduedTribes = region.subduedTribesForFaction(FactionIDs.AEDUI);
            PlaceAlliedTribe.execute(state, {factionId: aeduiFaction.id, regionId: region.id, tribeId: _.sample(subduedTribes).id});
            delete cisalpinaAdjacentById[region.id];
            effective = true;
        });

        let warbandsRemaining = aeduiFaction.availableWarbands().length;
        const numRegionsForWarbands = Math.ceil(warbandsRemaining.length / 3);
        _.each(_.sampleSize(cisalpinaAdjacentById, numRegionsForWarbands), function(region) {
            const numWarbandsToPlace = Math.min(warbandsRemaining, 3);
            PlaceWarbands.execute(state, {factionId: aeduiFaction.id, regionId: region.id, count: numWarbandsToPlace});
            delete cisalpinaAdjacentById[region.id];
            warbandsRemaining -= numWarbandsToPlace;
            effective = true;

            if(warbandsRemaining < 1) {
                return false;
            }
        });

        let auxiliaRemaining = romanFaction.availableAuxilia().length;
        const numRegionsForAuxilia = Math.ceil(auxiliaRemaining.length / 3);
        _.each(_.sampleSize(cisalpinaAdjacentById, numRegionsForAuxilia), function(region) {
            const numAuxiliaToPlace = Math.min(auxiliaRemaining, 3);
            PlaceAuxilia.execute(state, {factionId: romanFaction.id, regionId: region.id, count: numAuxiliaToPlace});
            delete cisalpinaAdjacentById[region.id];
            auxiliaRemaining -= numAuxiliaToPlace;
            effective = true;

            if(auxiliaRemaining < 1) {
                return false;
            }
        });

        if(aeduiFaction.resources() < 45) {
            aeduiFaction.addResources(4);
            effective = true;
        }

        return effective;
    }
}

export default Event40;
