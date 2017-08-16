import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import TurnContext from 'common/turnContext';
import HidePieces from 'fallingsky/actions/hidePieces';


class Event67 {
    static handleEvent(state) {
        const belgaeBot = state.playersByFaction[FactionIDs.BELGAE];
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(
            new TurnContext({
                                id: 'e66-1',
                                free: true,
                                noSpecial: true,
                                outOfSequence: true,
                                noEvent: true,
                                context: { allowedDestRegions: [RegionIDs.TREVERI, RegionIDs.NERVII] },
                                allowedCommands: [CommandIDs.MARCH]
                            }));

        const marchAction = belgaeBot.takeTurn(state);
        turn.popContext();
        turn.pushContext(
            new TurnContext({
                                id: 'e66-2',
                                free: true,
                                noSpecial: true,
                                outOfSequence: true,
                                noEvent: true,
                                allowedRegions: [RegionIDs.TREVERI, RegionIDs.NERVII],
                                restrictedCommands: [CommandIDs.MARCH]
                            }));

        const commandAction = belgaeBot.takeTurn(state);
        turn.popContext();

        let hidPieces = false;
        _.each([RegionIDs.TREVERI, RegionIDs.NERVII], regionId=> {
            const region = state.regionsById[regionId];
            const numToHide = region.getRevealedPiecesForFaction(FactionIDs.BELGAE).length + region.getScoutedPiecesForFaction(FactionIDs.BELGAE).length;
            if(numToHide > 0) {
                HidePieces.execute(state, {
                    factionId:FactionIDs.BELGAE,
                    regionId
                });
                hidPieces = true;
            }
        });

        return marchAction || commandAction || hidPieces;
    }
}

export default Event67;
