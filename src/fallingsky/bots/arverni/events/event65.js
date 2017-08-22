import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';

import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import RemovePieces from 'fallingsky/actions/removePieces';


class Event65 {
    static handleEvent(state) {
        let effective = false;
        const allyToReplace = _(state.regions).shuffle().filter(
            region => region.controllingFactionId() === FactionIDs.ARVERNI).map(region => {
            const germanicAllies = _.shuffle(region.getAlliesForFaction(FactionIDs.GERMANIC_TRIBES));
            if (germanicAllies.length === 0) {
                return;
            }

            return {
                ally: _.first(germanicAllies),
                regionId: region.id
            };

        }).compact().value().first();

        if (allyToReplace.length > 0) {
            const tribeId = allyToReplace.ally.tribeId;
            RemovePieces.execute(state, {
                factionId: allyToReplace.ally.factionId,
                regionId: allyToReplace.regionId,
                pieces: [allyToReplace.ally]
            });

            if (state.arverni.availableAlliedTribes().length > 0) {
                PlaceAlliedTribe.execute(state, {
                    factionId: FactionIDs.ARVERNI,
                    regionId: allyToReplace.regionId,
                    tribeId
                });
            }

            effective = true;
        }

        let numToReplace = 5;
        _(state.regions).shuffle().filter(region => region.controllingFactionId() === FactionIDs.ARVERNI).each(
            region => {

                const germanWarbandsToReplace = _.take(
                    region.getWarbandsOrAuxiliaForFaction(FactionIDs.GERMANIC_TRIBES), numToReplace);
                if (germanWarbandsToReplace) {
                    RemovePieces.execute(state, {
                        factionId: FactionIDs.GERMANIC_TRIBES,
                        regionId: region.id,
                        pieces: germanWarbandsToReplace
                    });

                    const numToPlace = Math.min(state.arverni.availableWarbands().length,
                                                germanWarbandsToReplace.length);
                    if (numToPlace > 0) {
                        PlaceWarbands.execute(state, {
                            factionId: FactionIDs.ARVERNI,
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
