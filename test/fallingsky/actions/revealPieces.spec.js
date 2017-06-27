import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import HidePieces from 'fallingsky/actions/hidePieces'
import RevealPieces from 'fallingsky/actions/revealPieces'
import PlaceWarbands from 'fallingsky/actions/placeWarbands'

describe("Reveal Pieces", function () {
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

    it('reveals all pieces in a region', function () {
        const aedui = state.regionsById[RegionIDs.AEDUI];
        PlaceWarbands.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, count: 5});
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(5);
        RevealPieces.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI});
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        state.actionHistory.undo(state);
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(5);
    });

    it('reveals a few pieces in a region', function () {
        const aedui = state.regionsById[RegionIDs.AEDUI];
        PlaceWarbands.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, count: 5});
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(5);
        RevealPieces.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, count: 1});
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(4);
        RevealPieces.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, count: 3});
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(1);
        state.actionHistory.undo(state);
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(4);
    });
});