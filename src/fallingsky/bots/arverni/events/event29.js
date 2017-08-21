import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import TribeIDs from 'fallingsky/config/tribeIds';
import RegionIDs from 'fallingsky/config/regionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import UndisperseTribe from 'fallingsky/actions/undisperseTribe';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import TurnContext from 'common/turnContext';


class Event29 {
    static handleEvent(state) {
        const suebiNorth = state.tribesById[TribeIDs.SUEBI_NORTH];
        const suebiSouth = state.tribesById[TribeIDs.SUEBI_SOUTH];

        this.handleSuebi(state, suebiNorth, RegionIDs.SUGAMBRI);
        this.handleSuebi(state, suebiSouth, RegionIDs.UBII);

        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e29',
                                             currentFactionId: FactionIDs.GERMANIC_TRIBES,
                                             free: true,
                                             noEvent: true,
                                             outOfSequence: true,
                                             restrictedCommands: [CommandIDs.RALLY]
                                         }));
        state.playersByFaction[FactionIDs.GERMANIC_TRIBES].takeTurn(state);
        turn.popContext();

        return true;
    }

    static handleSuebi(state, tribe, regionId) {
        if (tribe.isDispersed()) {
            UndisperseTribe.execute(state, {
                tribeId: tribe.id,
                fully: true
            });
        }

        if (tribe.isSubdued() && state.germanic.hasAvailableAlliedTribe()) {
            PlaceAlliedTribe.execute(state, {
                factionId: FactionIDs.GERMANIC_TRIBES,
                regionId,
                tribeId: tribe.id
            });
        }
    }
}

export default Event29
