import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';

import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import RemovePieces from 'fallingsky/actions/removePieces';


class Event65 {
    static handleEvent(state) {
        if (!state.belgae.hasAvailableAlliedTribe()) {
            return false;
        }

        let effective = false;
        const allyToReplace = _(state.regions).shuffle().filter(
            region => region.controllingFactionId() === FactionIDs.BELGAE).map(region => {
            const germanicAllies = _.shuffle(region.getAlliesForFaction(FactionIDs.GERMANIC_TRIBES));
            if (germanicAllies.length === 0) {
                return;
            }

            return {
                ally: _.first(germanicAllies),
                regionId: region.id
            };

        }).compact().first();

        if (!allyToReplace) {
            return false;
        }

        const tribeId = allyToReplace.ally.tribeId;
        RemovePieces.execute(state, {
            factionId: allyToReplace.ally.factionId,
            regionId: allyToReplace.regionId,
            pieces: [allyToReplace.ally]
        });

        PlaceAlliedTribe.execute(state, {
            factionId: FactionIDs.BELGAE,
            regionId: allyToReplace.regionId,
            tribeId
        });

        effective = true;


        let numToReplace = 5;
        _(state.regions).shuffle().filter(region => region.controllingFactionId() === FactionIDs.BELGAE).each(
            region => {

                const germanWarbandsToReplace = _.take(
                    region.getWarbandsOrAuxiliaForFaction(FactionIDs.GERMANIC_TRIBES), numToReplace);
                if (germanWarbandsToReplace.length > 0) {
                    RemovePieces.execute(state, {
                        factionId: FactionIDs.GERMANIC_TRIBES,
                        regionId: region.id,
                        pieces: germanWarbandsToReplace
                    });

                    const numToPlace = Math.min(state.belgae.availableWarbands().length,
                                                germanWarbandsToReplace.length);
                    if (numToPlace > 0) {
                        PlaceWarbands.execute(state, {
                            factionId: FactionIDs.BELGAE,
                            regionId: region.id,
                            count: numToPlace
                        });
                    }

                    numToReplace -= germanWarbandsToReplace.length;
                    effective = true;
                }

                if (numToReplace === 0) {
                    return false;
                }
            });

        return effective;
    }
}

export default Event65
