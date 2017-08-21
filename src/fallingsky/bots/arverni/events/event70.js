import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import TurnContext from 'common/turnContext';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';

class Event70 {
    static handleEvent(state) {
        let effective = false;
        if (state.arverni.availableWarbands().length > 0) {
            const regionId = _.sample([RegionIDs.ATREBATES, RegionIDs.CARNUTES, RegionIDs.MANDUBII]);
            const count = Math.min(state.arverni.availableWarbands().length, 6);
            PlaceWarbands.execute(state, {
                factionId: FactionIDs.ARVERNI,
                regionId,
                count
            });
            effective = true;
        }

        const arverniBot = state.playersByFaction[FactionIDs.ARVERNI];
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(
            new TurnContext({
                                id: 'e70',
                                free: true,
                                outOfSequence: true,
                                noEvent: true,
                                allowedRegions: [RegionIDs.ATREBATES, RegionIDs.CARNUTES, RegionIDs.MANDUBII],
                                context: { ignoreSARegionCondition : true }
                            }));

        const commandAction = arverniBot.takeTurn(state);
        if (commandAction) {
            effective = true;
        }
        turn.popContext();

        return effective;
    }


}

export default Event70