import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import TribeIDs from 'fallingsky/config/tribeIds';

import PlaceCitadel from 'fallingsky/actions/placeCitadel';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import RemovePieces from 'fallingsky/actions/removePieces';

const EnemyPriorities = [FactionIDs.ROMANS, FactionIDs.AEDUI, FactionIDs.ARVERNI, FactionIDs.GERMANIC_TRIBES];


class Event68 {
    static handleEvent(state) {
        const remi = state.tribesById[TribeIDs.REMI];
        if (remi.alliedFactionId() !== FactionIDs.BELGAE) {
            return false;
        }

        if (!state.belgae.hasAvailableCitadel()) {
            return false;
        }

        const alesia = state.tribesById[TribeIDs.MANDUBII];
        const cenabum = state.tribesById[TribeIDs.CARNUTES];

        const chosenTribe = _([alesia, cenabum]).shuffle().filter(
            tribe => !tribe.isDispersed() && tribe.alliedFactionId() !== FactionIDs.BELGAE).sortBy(
            tribe => tribe.alliedFactionId() ? _.indexOf(EnemyPriorities, tribe.alliedFactionId()) : 4).first();

        if (!chosenTribe) {
            return false;
        }

        const regionId = chosenTribe.id === TribeIDs.MANDUBII ? RegionIDs.MANDUBII : RegionIDs.CARNUTES;
        const region = state.regionsById[regionId];

        const pieceToRemove = _.find(region.getAlliesAndCitadels(), piece => piece.tribeId === chosenTribe.id);

        if(pieceToRemove) {
            RemovePieces.execute(state, {
                factionId: pieceToRemove.factionId,
                regionId,
                pieces: [pieceToRemove]
            });
        }

        PlaceCitadel.execute(state, {
            factionId: FactionIDs.BELGAE,
            regionId,
            tribeId: chosenTribe.id
        });

        if(state.belgae.availableWarbands().length > 0) {
            PlaceWarbands.execute(state, {
                factionId: FactionIDs.BELGAE,
                regionId,
                count: Math.min(4, state.belgae.availableWarbands().length)
            });
        }


        return true;
    }


}

export default Event68