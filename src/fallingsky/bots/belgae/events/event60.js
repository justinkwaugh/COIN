import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import TribeIDs from 'fallingsky/config/tribeIds';
import RegionIDs from 'fallingsky/config/regionIds';

import UndisperseTribe from 'fallingsky/actions/undisperseTribe';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import RemovePieces from 'fallingsky/actions/removePieces';



class Event60 {
    static handleEvent(state) {
        const treveri = state.tribesById[TribeIDs.TREVERI];
        const ubii = state.tribesById[TribeIDs.UBII];

        return this.handleTribe(state, treveri, RegionIDs.TREVERI) || this.handleTribe(state, ubii, RegionIDs.UBII);

    }

    static handleTribe(state, tribe, regionId) {
        let effective = false;
        const region = state.regionsById[regionId];

        if (tribe.isDispersed()) {
            UndisperseTribe.execute(state, {
                tribeId: tribe.id,
                fully: true
            });
            effective = true;
        }

        if (tribe.isAllied()) {
            const ally = _.find(region.getAlliesAndCitadels(),
                                piece => piece.type === 'alliedtribe' && piece.tribeId === tribe.id && piece.factionId !== FactionIDs.BELGAE);
            if (ally) {
                RemovePieces.execute(state, {
                                         factionId: ally.factionId,
                                         regionId,
                                         pieces: [ally]
                                     });
                effective = true;
            }
        }

        if (tribe.isSubdued() && state.belgae.hasAvailableAlliedTribe()) {
            PlaceAlliedTribe.execute(state, {
                factionId: FactionIDs.BELGAE,
                regionId,
                tribeId: tribe.id
            });
            effective = true;
        }

        if(state.belgae.availableWarbands().length > 0) {
            PlaceWarbands.execute(state, {
                factionId: FactionIDs.BELGAE,
                regionId,
                count: Math.min(2, state.belgae.availableWarbands().length)
            });
            effective = true;
        }

        if(state.germanic.availableWarbands().length > 0) {
            PlaceWarbands.execute(state, {
                factionId: FactionIDs.GERMANIC_TRIBES,
                regionId,
                count: 1
            });
            effective = true;
        }
        return effective;
    }
}

export default Event60
