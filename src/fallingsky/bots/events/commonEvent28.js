import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import PlaceCitadel from 'fallingsky/actions/placeCitadel';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';


class CommonEvent28 {
    static handleEvent(state, factionId) {
        const faction = state.factionsById[factionId];
        const canPlaceAllyOrCitadel = faction.hasAvailableCitadel() || faction.hasAvailableAlliedTribe();
        if(!canPlaceAllyOrCitadel) {
            return false;
        }

        let effective = false;
        if(faction.hasAvailableAlliedTribe()) {
            const subduedCitiesNotRomanControlled = _(state.regions).filter(
                function (region) {
                    return region.controllingFactionId() !== FactionIDs.ROMANS;
                }).map(
                function (region) {
                    return _.find(
                        region.tribes(), function (tribe) {
                            return tribe.isSubdued() && tribe.isCity;
                        });
                }).compact().sampleSize(faction.availableAlliedTribes().length).value();

            _.each(subduedCitiesNotRomanControlled, function(city) {
                PlaceAlliedTribe.execute(state, { factionId: factionId, regionId: city.regionId, tribeId: city.id});
                effective = true;
            });

        }

        if(faction.hasAvailableCitadel()) {
            const factionAlliedCities = _(state.tribes).filter(function(tribe){
                return tribe.isCity && tribe.isAllied() && tribe.alliedFactionId() === factionId;
            }).sampleSize(faction.availableCitadels().length).value();

            _.each(factionAlliedCities, function(city) {
                PlaceCitadel.execute(state, { factionId: factionId, regionId: city.regionId, tribeId: city.id});
                effective = true;
            });

        }

        return effective;
    }
}

export default CommonEvent28;
