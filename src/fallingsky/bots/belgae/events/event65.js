import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';

import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import RemovePieces from 'fallingsky/actions/removePieces';


class Event65 {
    static handleEvent(state) {
        if (state.belgae.availableAlliedTribes().length === 0) {
            return false;
        }

        const alliesToReplace = _(state.regions).filter(
            region => region.controllingFactionId() === FactionIDs.BELGAE).map(region => {
            const germanicAllies = _.shuffle(region.getAlliesForFaction(FactionIDs.GERMANIC_TRIBES));
            if (germanicAllies.length === 0) {
                return;
            }

            return {
                ally: _.first(germanicAllies),
                regionId: region.id
            };

        }).compact().value();

        if (alliesToReplace.length === 0) {
            return false;
        }

        _.each(alliesToReplace, allyData => {
            const tribeId = allyData.ally.tribeId;
            RemovePieces.execute(state, {
                factionId: allyData.ally.factionId,
                regionId: allyData.regionId,
                pieces: [allyData.ally]
            });

            if (state.belgae.availableAlliedTribes().length === 0) {
                return false;
            }

            PlaceAlliedTribe.execute(state, {
                factionId: FactionIDs.BELGAE,
                regionId: allyData.regionId,
                tribeId
            });
        });

        if (state.belgae.availableWarbands().length > 0) {
            _(state.regions).filter(region => region.controllingFactionId() === FactionIDs.BELGAE).each(region => {
                if (state.belgae.availableWarbands.length === 0) {
                    return false;
                }

                const germanWarbandsToReplace = _.take(
                    region.getWarbandsOrAuxiliaForFaction(FactionIDs.GERMANIC_TRIBES),
                    Math.min(5, state.belgae.availableWarbands()));

                if (germanWarbandsToReplace) {
                    RemovePieces.execute(state, {
                        factionId: FactionIDs.GERMANIC_TRIBES,
                        regionId: region.id,
                        pieces: germanWarbandsToReplace
                    });

                    PlaceWarbands.execute(state, {
                        factionId: FactionIDs.BELGAE,
                        regionId: region.id,
                        count: germanWarbandsToReplace.length
                    });
                }
            })
        }
        return true;
    }


}

export default Event65
