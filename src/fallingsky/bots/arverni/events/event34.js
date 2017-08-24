import _ from 'lib/lodash'
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import ArverniRally from 'fallingsky/bots/arverni/arverniRally';
import TribeIds from 'fallingsky/config/tribeIds';
import RemovePieces from 'fallingsky/actions/removePieces';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import PlaceCitadel from 'fallingsky/actions/placeCitadel';
import TurnContext from 'common/turnContext';


class Event34 {
    static handleEvent(state) {
        let effective = false;

        const mandubiiCity = state.tribesById[TribeIds.MANDUBII];
        const carnutesCity = state.tribesById[TribeIds.CARNUTES];

        if (state.arverni.hasAvailableCitadel() &&
            ((mandubiiCity.isCitadel() && mandubiiCity.alliedFactionId() !== FactionIDs.ARVERNI) ||
             (carnutesCity.isCitadel() && carnutesCity.alliedFactionId() !== FactionIDs.ARVERNI))) {

            const mandubii = state.regionsById[RegionIDs.MANDUBII];
            const carnutes = state.regionsById[RegionIDs.CARNUTES];

            _.each([mandubii, carnutes], region=> {
                _.each(region.tribes(), tribe => {
                    if (!tribe.alliedFactionId() && tribe.alliedFactionId() === FactionIDs.ARVERNI) {
                        return;
                    }

                    if (tribe.isAllied() && state.arverni.hasAvailableAlliedTribe()) {
                        const ally = _.find(region.getAlliesAndCitadels(),
                                            allyOrCitadel => allyOrCitadel.tribeId === tribe.id);
                        RemovePieces.execute(state, {
                            factionId: ally.factionId,
                            regionId: region.id,
                            pieces: [ally]
                        });

                        PlaceAlliedTribe.execute(state, {
                            factionId: FactionIDs.ARVERNI,
                            regionId: region.id,
                            tribeId: tribe.id
                        });
                    }

                    if (tribe.isCitadel() && state.arverni.hasAvailableCitadel()) {
                        const citadel = _.find(region.getAlliesAndCitadels(),
                                               allyOrCitadel => allyOrCitadel.tribeId === tribe.id);
                        RemovePieces.execute(state, {
                            factionId: citadel.factionId,
                            regionId: region.id,
                            pieces: [citadel]
                        });

                        PlaceCitadel.execute(state, {
                            factionId: FactionIDs.ARVERNI,
                            regionId: region.id,
                            tribeId: tribe.id
                        });
                    }
                });
            });

            effective = true;
        }
        else {
            const turn = state.turnHistory.currentTurn;
            turn.pushContext(new TurnContext({
                                                 id: 'e34',
                                                 free: true,
                                                 noSpecial: true,
                                                 context: {acco: true}
                                             }));
            effective = ArverniRally.rally(state, turn.getContext());
            turn.popContext();
        }

        return effective;
    }
}

export default Event34
