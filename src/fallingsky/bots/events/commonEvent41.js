import _ from 'lib/lodash';
import RegionIDs from 'fallingsky/config/regionIds';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import PlaceCitadel from 'fallingsky/actions/placeCitadel';
import AddResources from 'fallingsky/actions/addResources';

class CommonEvent41 {
    static handleEvent(state, factionId) {
        const faction = state.factionsById[factionId];

        let effective = false;

        const bituriges = state.regionsById[RegionIDs.BITURIGES];
        const avericumAdjacentById = _.keyBy(bituriges.adjacent, 'id');
        avericumAdjacentById[bituriges.id] = bituriges;

        const tribesToPlaceAlly = _(avericumAdjacentById).map(function(region) {
            return region.subduedTribesForFaction(factionId);
        }).flatten().compact().value();

        let numAlliesToPlace = _.min([faction.availableAlliedTribes().length, tribesToPlaceAlly.length, 2]);
        if(numAlliesToPlace > 0) {
            const groupedTribes = _.groupBy(
                tribesToPlaceAlly, function (tribe) {
                    return tribe.isCity ? 'city' : 'notcity';
                });

            _.each(_.sampleSize(groupedTribes.city || [], numAlliesToPlace), function(tribe) {
                PlaceAlliedTribe.execute(state, {factionId: faction.id, regionId: tribe.regionId, tribeId: tribe.id});
                numAlliesToPlace -= 1;

                if(numAlliesToPlace < 1) {
                    return false;
                }
            });

            _.each(_.sampleSize(groupedTribes.notcity || [], numAlliesToPlace), function(tribe) {
                PlaceAlliedTribe.execute(state, {factionId: faction.id, regionId: tribe.regionId, tribeId: tribe.id});
                numAlliesToPlace -= 1;

                if(numAlliesToPlace < 1) {
                    return false;
                }
            });

            effective = true;
        }

        if(faction.availableCitadels().length > 0) {
            const alliesToUpgrade = _(avericumAdjacentById).map(
                function (region) {
                    return region.getAlliedCityForFaction(factionId);
                }).flatten().compact().value();

            if(alliesToUpgrade.length > 0) {
                const tribe = _.sample(alliesToUpgrade);
                PlaceCitadel.execute(state, {factionId: faction.id, regionId: tribe.regionId, tribeId: tribe.id});
                effective = true;
            }
        }

        const numResourcesToGain = _.reduce(avericumAdjacentById, function(sum, region) {
            return sum + region.numAlliesAndCitadelsForFaction(factionId);
        }, 0);

        if(numResourcesToGain > 0 && faction.resources() < 45) {
            AddResources.execute(state, { factionId: factionId, count: numResourcesToGain});
            effective = true;
        }

        return effective;
    }
}

export default CommonEvent41;
