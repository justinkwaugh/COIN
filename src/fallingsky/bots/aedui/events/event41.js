import _ from '../../../../lib/lodash';
import FactionIDs from '../../../config/factionIds';
import RegionIDs from '../../../config/regionIds';
import PlaceAlliedTribe from '../../../actions/placeAlliedTribe';
import PlaceCitadel from '../../../actions/placeCitadel';
import AddResources from '../../../actions/addResources';

class Event41 {
    static handleEvent(state) {
        const aeduiFaction = state.factionsById[FactionIDs.AEDUI];

        let effective = false;

        const bituriges = state.regionsById[RegionIDs.BITURIGES];
        const avericumAdjacentById = _.keyBy(bituriges.adjacent, 'id');
        avericumAdjacentById[bituriges.id] = bituriges;

        const tribesToPlaceAlly = _(avericumAdjacentById).map(function(region) {
            return region.subduedTribesForFaction(FactionIDs.AEDUI);
        }).flatten().compact().value();

        let numAlliesToPlace = _.min([aeduiFaction.availableAlliedTribes().length, tribesToPlaceAlly.length, 2]);
        if(numAlliesToPlace > 0) {
            const groupedTribes = _.groupBy(
                tribesToPlaceAlly, function (tribe) {
                    return tribe.isCity ? 'city' : 'notcity';
                });

            _.each(_.sampleSize(groupedTribes.city || [], numAlliesToPlace), function(tribe) {
                PlaceAlliedTribe.execute(state, {factionId: aeduiFaction.id, regionId: tribe.regionId, tribeId: tribe.id});
                numAlliesToPlace -= 1;

                if(numAlliesToPlace < 1) {
                    return false;
                }
            });

            _.each(_.sampleSize(groupedTribes.notcity || [], numAlliesToPlace), function(tribe) {
                PlaceAlliedTribe.execute(state, {factionId: aeduiFaction.id, regionId: tribe.regionId, tribeId: tribe.id});
                numAlliesToPlace -= 1;

                if(numAlliesToPlace < 1) {
                    return false;
                }
            });

            effective = true;
        }

        if(aeduiFaction.availableCitadels().length > 0) {
            const alliesToUpgrade = _(avericumAdjacentById).map(
                function (region) {
                    return region.getAlliedCityForFaction(FactionIDs.AEDUI);
                }).flatten().compact().value();

            if(alliesToUpgrade.length > 0) {
                const tribe = _.sample(alliesToUpgrade);
                PlaceCitadel.execute(state, {factionId: aeduiFaction.id, regionId: tribe.regionId, tribeId: tribe.id});
                effective = true;
            }
        }

        const numResourcesToGain = _.reduce(avericumAdjacentById, function(sum, region) {
            return sum + region.numAlliesAndCitadelsForFaction(FactionIDs.AEDUI);
        }, 0);

        if(numResourcesToGain > 0 && aeduiFaction.resources() < 45) {
            AddResources.execute(state, { factionId: FactionIDs.AEDUI, count: numResourcesToGain});
            effective = true;
        }

        return effective;
    }
}

export default Event41;
