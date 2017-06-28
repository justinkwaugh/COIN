import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import PlaceLeader from 'fallingsky/actions/placeLeader'


describe("Place Leader", function () {
    let state;
    let belgae;
    let arverni;
    let aedui;
    let romans;
    let germanic;

    beforeEach(function () {
        state = new FallingSkyGameState();
        belgae = state.belgae;
        arverni = state.arverni;
        aedui = state.aedui;
        romans = state.romans;
        germanic = state.germanic;
    });

    it('places roman leader in a region', function () {
        const aedui = state.regionsById[RegionIDs.AEDUI];
        expect(aedui.getLeaderForFaction(FactionIDs.ROMANS)).to.be.null;

        PlaceLeader.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.AEDUI,
        });

        expect(aedui.getLeaderForFaction(FactionIDs.ROMANS)).to.not.be.null;

        state.actionHistory.undo(state);

        expect(aedui.getLeaderForFaction(FactionIDs.ROMANS)).to.be.null;
        expect(romans.hasAvailableLeader()).to.not.be.null;
    });


});