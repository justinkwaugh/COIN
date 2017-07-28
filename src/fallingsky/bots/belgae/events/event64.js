import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionGroups from 'fallingsky/config/regionGroups';
import RegionIDs from 'fallingsky/config/regionIds';

import BelgaeRally from 'fallingsky/bots/belgae/belgaeRally';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import TurnContext from 'common/turnContext';
import RemovePieces from 'fallingsky/actions/removePieces';


class Event64 {
    static handleEvent(state) {
        let effective = false;
        const region = state.regionsById[RegionIDs.ATREBATES];
        const enemyAllies = _(region.getAlliesAndCitadels()).filter(
            piece => piece.type === 'alliedtribe' && piece.factionId !== FactionIDs.BELGAE).take(2).value();

        _.each(enemyAllies, ally => {
            RemovePieces.execute(state, {
                factionId: ally.factionId,
                regionId: region.id,
                pieces: [ally]
            });
            effective = true;
        });

        const subduedTribes = _.take(region.subduedTribesForFaction(FactionIDs.BELGAE),
                                     Math.min(2, state.belgae.availableAlliedTribes().length));
        _.each(subduedTribes, tribe => {
            PlaceAlliedTribe.execute(state, {
                factionId: FactionIDs.BELGAE,
                regionId: region.id,
                tribeId: tribe.id
            });
            effective = true;
        });

        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e64',
                                             free: true,
                                             noSpecial: true,
                                             limited: true,
                                             allowedRegions: _(state.regions).filter(
                                                 {group: RegionGroups.BELGICA}).value()
                                         }));
        if (BelgaeRally.rally(state, turn.getContext())) {
            effective = true;
        }
        turn.popContext();
        return effective;
    }


}

export default Event64
