import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionGroups from 'fallingsky/config/regionGroups';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';

class Event22 {
    static handleEvent(state) {
        const subduedTribeData = _(state.regions).shuffle().filter(
            region => region.getPiecesForFaction(FactionIDs.ROMANS).length > 0).map(region => {
            const tribes = region.getSubduedTribes();
            if (tribes.length === 0) {
                return;
            }

            return {
                region,
                tribes,
                group: region.group
            };

        }).compact().value();

        if (subduedTribeData.length === 0) {
            return false;
        }

        if (!state.arverni.hasAvailableAlliedTribe() || state.arverni.availableWarbands().length === 0) {
            return false;
        }

        let numAdded = 0;
        _.each(subduedTribeData, tribeData => {
            let alliesPlacedInRegion = 0;
            _.each(tribeData.tribes, tribe => {
                PlaceAlliedTribe.execute(state, {
                    factionId: FactionIDs.ARVERNI,
                    regionId: tribeData.region.id,
                    tribeId: tribe.id
                });

                alliesPlacedInRegion += 1;
                numAdded += 1;
                if (numAdded === 2 || (numAdded === 1 && state.arverni.availableWarbands().length === 1) || state.arverni.availableAlliedTribes().length ===0) {
                    return false;
                }
            });

            if (state.arverni.availableWarbands().length > 0) {
                const numWarbandsToPlace = Math.min(state.arverni.availableWarbands().length, alliesPlacedInRegion);
                PlaceWarbands.execute(state, {
                                          factionId: FactionIDs.ARVERNI,
                                          regionId: tribeData.region.id,
                                          count: numWarbandsToPlace
                                      });
            }

            if (numAdded === 2 || state.arverni.availableWarbands().length === 0 || state.arverni.availableAlliedTribes().length === 0) {
                return false;
            }
        });
        return true;
    }
}

export default Event22
