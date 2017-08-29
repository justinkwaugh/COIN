import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import TurnContext from 'common/turnContext';

class Event52 {
    static handleEvent(state) {

        if(state.regionsById[RegionIDs.CARNUTES].controllingFactionId() !== RegionIDs.ARVERNI) {
            return false;
        }
        let effective = false;
        const arverniBot = state.playersByFaction[FactionIDs.ARVERNI];
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(
            new TurnContext({
                                id: 'e52',
                                free: true,
                                outOfSequence: true,
                                noEvent: true
                            }));

        const commandAction = arverniBot.takeTurn(state);
        if (commandAction) {
            effective = true;
        }
        turn.popContext();

        return effective;
    }
}

export default Event52