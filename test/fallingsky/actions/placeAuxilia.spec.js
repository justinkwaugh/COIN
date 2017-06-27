import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import PlaceAuxilia from 'fallingsky/actions/placeAuxilia'


describe("Place Auxilia", function () {
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

    it('places roman pieces in a region', function () {
        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        expect(aeduiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        expect(aeduiRegion.getHiddenPiecesForFaction(FactionIDs.ROMANS).length).to.equal(0);
        PlaceAuxilia.execute(state, {
            factionId: FactionIDs.ROMANS,
            regionId: RegionIDs.AEDUI,
            count: 5
        });
        expect(aeduiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(5);
        expect(aeduiRegion.getHiddenPiecesForFaction(FactionIDs.ROMANS).length).to.equal(5);

        state.actionHistory.undo(state);

        expect(aeduiRegion.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length).to.equal(0);
        expect(aeduiRegion.getHiddenPiecesForFaction(FactionIDs.ROMANS).length).to.equal(0);
    });


});