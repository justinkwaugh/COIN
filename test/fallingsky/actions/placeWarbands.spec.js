import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import PlaceWarbands from 'fallingsky/actions/placeWarbands'


describe("Place Warbands", function () {
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

    it('places aedui pieces in a region', function () {
        const aedui = state.regionsById[RegionIDs.AEDUI];
        expect(aedui.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(0);
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        PlaceWarbands.execute(state, {
            factionId: FactionIDs.AEDUI,
            regionId: RegionIDs.AEDUI,
            count: 5
        });
        expect(aedui.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(5);
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(5);

        state.actionHistory.undo(state);

        expect(aedui.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length).to.equal(0);
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
    });


});