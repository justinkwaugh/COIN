import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import TurnContext from 'common/turnContext';


class Event69 {
    static handleEvent(state) {

        if(state.germanic.availableWarbands().length > 0) {
            PlaceWarbands.execute(state, {
                factionId: FactionIDs.GERMANIC_TRIBES,
                regionId: RegionIDs.NERVII,
                count: Math.min(4, state.germanic.availableWarbands().length)
            })
        }

        if(state.germanic.availableWarbands().length > 0) {
            PlaceWarbands.execute(state, {
                factionId: FactionIDs.GERMANIC_TRIBES,
                regionId: RegionIDs.TREVERI,
                count: Math.min(4, state.germanic.availableWarbands().length)
            })
        }

        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e69',
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
}

export default Event69
