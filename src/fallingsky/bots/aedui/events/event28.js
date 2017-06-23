import _ from '../../../../lib/lodash';
import FactionIDs from '../../../config/factionIds';
import PlaceCitadel from '../../../actions/placeCitadel';
import PlaceAlliedTribe from '../../../actions/placeAlliedTribe';


class Event28 {
    static handleEvent(state) {
        const aedui = state.factionsById[FactionIDs.AEDUI];
        const canPlaceAllyOrCitadel = aedui.hasAvailableCitadel() || aedui.hasAvailableAlliedTribe();
        if(!canPlaceAllyOrCitadel) {
            return false;
        }

        let effective = false;
        if(aedui.hasAvailableAlliedTribe()) {
            const subduedCitiesNotRomanControlled = _(state.regions).filter(
                function (region) {
                    return region.controllingFactionId() !== FactionIDs.ROMANS;
                }).map(
                function (region) {
                    return _.find(
                        region.tribes, function (tribe) {
                            return tribe.isSubdued() && tribe.isCity;
                        });
                }).compact().sampleSize(aedui.availableAlliedTribes().length).value();

            _.each(subduedCitiesNotRomanControlled, function(city) {
                PlaceAlliedTribe.perform(state, { faction: aedui, regionId: city.regionId, tribe: city});
            });
            effective = true;
        }

        if(aedui.hasAvailableCitadel()) {
            const aeduiAlliedCities = _(state.tribes).filter(function(tribe){
                return tribe.isCity && tribe.isAllied() && tribe.alliedFactionId() === FactionIDs.AEDUI;
            }).sampleSize(aedui.availableCitadels().length).value();

            _.each(aeduiAlliedCities, function(city) {
                PlaceCitadel.perform(state, { faction: aedui, regionId: city.regionId, tribe: city});
            });
            effective = true;
        }

        return effective;
    }
}

export default Event28;
