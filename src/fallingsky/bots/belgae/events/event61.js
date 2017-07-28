import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import TribeIDs from 'fallingsky/config/tribeIds';
import RegionIDs from 'fallingsky/config/regionIds';

import UndisperseTribe from 'fallingsky/actions/undisperseTribe';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import AddResources from 'fallingsky/actions/addResources';
import RemovePieces from 'fallingsky/actions/removePieces';



class Event61 {
    static handleEvent(state) {
        const nervii = state.tribesById[TribeIDs.NERVII];
        const eburones = state.tribesById[TribeIDs.EBURONES];

        this.handleTribe(state, nervii, RegionIDs.NERVII);
        this.handleTribe(state, eburones, RegionIDs.NERVII);

        return true;
    }

    static handleTribe(state, tribe, regionId) {
        const region = state.regionsById[regionId];

        if (tribe.isDispersed()) {
            UndisperseTribe.execute(state, {
                tribeId: tribe.id,
                fully: true
            });
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
            }
        }

        if (tribe.isSubdued() && state.belgae.hasAvailableAlliedTribe()) {
            PlaceAlliedTribe.execute(state, {
                factionId: FactionIDs.BELGAE,
                regionId,
                tribeId: tribe.id
            });
        }

        AddResources.execute(state, {
            factionId: FactionIDs.BELGAE,
            count: 6
        });

    }
}

export default Event61
