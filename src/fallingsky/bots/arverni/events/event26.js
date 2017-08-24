import _ from 'lib/lodash'
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import ArverniRally from 'fallingsky/bots/arverni/arverniRally';
import RemovePieces from 'fallingsky/actions/removePieces';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import TurnContext from 'common/turnContext';


class Event26 {
    static handleEvent(state) {
        let effective = false;

        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        _.each(arverniRegion.tribes(), tribe => {

            if (tribe.alliedFactionId() === FactionIDs.ARVERNI) {
                return;
            }

            if (tribe.isAllied()) {
                const ally = _.find(arverniRegion.getAlliesAndCitadels(),
                                    allyOrCitadel => allyOrCitadel.tribeId === tribe.id);
                RemovePieces.execute(state, {
                    factionId: ally.factionId,
                    regionId: arverniRegion.id,
                    pieces: [ally]
                });
                effective = true;
            }

            if (tribe.isSubdued() && state.arverni.hasAvailableAlliedTribe()) {
                PlaceAlliedTribe.execute(state, {
                    factionId: FactionIDs.ARVERNI,
                    regionId: arverniRegion.id,
                    tribeId: tribe.id
                });
                effective = true;
            }
        });

        const vercingetorixRegion = this.findVercingetorixRegion(state);
        if (vercingetorixRegion) {
            const regions = _([vercingetorixRegion]).concat(vercingetorixRegion.adjacent).map('id').value();

            const turn = state.turnHistory.currentTurn;
            turn.pushContext(new TurnContext({
                                                 id: 'e26',
                                                 free: true,
                                                 noSpecial: true,
                                                 allowedRegions: regions
                                             }));
            const commandAction = ArverniRally.rally(state, turn.getContext());
            if (commandAction) {
                effective = true;
            }
            turn.popContext();
        }


        return effective;
    }

    static findVercingetorixRegion(state) {
        return _.find(state.regions, function (region) {
            return _.find(region.piecesByFaction()[FactionIDs.ARVERNI],
                          piece => piece.type === 'leader' && !piece.isSuccessor());
        });
    }
}

export default Event26
