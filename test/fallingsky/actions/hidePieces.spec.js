import _ from 'lib/lodash';
import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import HidePieces from 'fallingsky/actions/hidePieces'
import RevealPieces from 'fallingsky/actions/revealPieces'
import ScoutPieces from 'fallingsky/actions/scoutPieces'
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
        PlaceWarbands.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, count: 5});
        RevealPieces.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI});
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        HidePieces.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI});
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(5);
        state.actionHistory.undo(state);
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
    });

    it('hides some revealed, some scouted', function () {
        const aedui = state.regionsById[RegionIDs.AEDUI];
        PlaceWarbands.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, count: 5});
        RevealPieces.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, count: 4});
        const pieces = _.take(aedui.getRevealedPiecesForFaction(FactionIDs.AEDUI),2);
        ScoutPieces.execute(state, { factionId: FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, pieces: pieces});
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(1);
        expect(aedui.getRevealedPiecesForFaction(FactionIDs.AEDUI).length).to.equal(2);
        expect(aedui.getScoutedPiecesForFaction(FactionIDs.AEDUI).length).to.equal(2);
        HidePieces.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI });
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(3);
        expect(aedui.getRevealedPiecesForFaction(FactionIDs.AEDUI).length).to.equal(2);
        state.actionHistory.undo(state);
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(1);
        expect(aedui.getRevealedPiecesForFaction(FactionIDs.AEDUI).length).to.equal(2);
        expect(aedui.getScoutedPiecesForFaction(FactionIDs.AEDUI).length).to.equal(2);
    });

    it('hides some revealed, some scouted fully', function () {
        const aedui = state.regionsById[RegionIDs.AEDUI];
        PlaceWarbands.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, count: 5});
        RevealPieces.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, count: 4});
        const pieces = _.take(aedui.getRevealedPiecesForFaction(FactionIDs.AEDUI),2);
        ScoutPieces.execute(state, { factionId: FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, pieces: pieces});
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(1);
        expect(aedui.getRevealedPiecesForFaction(FactionIDs.AEDUI).length).to.equal(2);
        expect(aedui.getScoutedPiecesForFaction(FactionIDs.AEDUI).length).to.equal(2);
        HidePieces.execute(state, { factionId : FactionIDs.AEDUI, regionId : RegionIDs.AEDUI, fully: true });
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(5);
        state.actionHistory.undo(state);
        expect(aedui.getHiddenPiecesForFaction(FactionIDs.AEDUI).length).to.equal(1);
        expect(aedui.getRevealedPiecesForFaction(FactionIDs.AEDUI).length).to.equal(2);
        expect(aedui.getScoutedPiecesForFaction(FactionIDs.AEDUI).length).to.equal(2);
    });

});