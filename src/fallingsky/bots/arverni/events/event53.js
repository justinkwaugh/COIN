import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import HidePieces from 'fallingsky/actions/hidePieces';
import TurnContext from 'common/turnContext';


class Event53 {
    static handleEvent(state) {

        _.each(state.regions, region=> {
            if(region.getRevealedPiecesForFaction(FactionIDs.GERMANIC_TRIBES).length > 0 || region.getScoutedPiecesForFaction(FactionIDs.GERMANIC_TRIBES).length > 0) {
                HidePieces.execute(state, {
                    factionId: FactionIDs.GERMANIC_TRIBES,
                    regionId: region.id
                });
            }
        });

        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({
                                             id: 'e69',
                                             currentFactionId: FactionIDs.GERMANIC_TRIBES,
                                             free: true,
                                             noEvent: true,
                                             outOfSequence: true,
                                             restrictedCommands: [CommandIDs.MARCH],
                                             context: {
                                                 consuetudine: true
                                             }
                                         }));
        state.playersByFaction[FactionIDs.GERMANIC_TRIBES].takeTurn(state);
        turn.popContext();

        return true;
    }
}

export default Event53
