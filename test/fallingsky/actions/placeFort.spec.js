import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import PlaceFort from 'fallingsky/actions/placeFort'


describe("Place Fort", function () {
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

    it('places fort in a region', function () {
        const aedui = state.regionsById[RegionIDs.AEDUI];
        expect(aedui.getFort()).to.be.null;

        PlaceFort.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.AEDUI,
        });

        expect(aedui.getFort()).to.not.be.null;

        state.actionHistory.undo(state);

        expect(aedui.getFort()).to.be.null;
    });


});