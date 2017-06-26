import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import HidePieces from 'fallingsky/actions/hidePieces'
import RevealPieces from 'fallingsky/actions/revealPieces'
import PlaceWarbands from 'fallingsky/actions/placeWarbands'

describe("Hide Pieces", function () {
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

    it('hides all pieces in a region', function () {
        const aedui = state.regionsById[RegionIDs.AEDUI];
        PlaceWarbands.run(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, count: 5});
        RevealPieces.run(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI});
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        HidePieces.run(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI});
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(5);
        state.history.undo(state);
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
    });


});