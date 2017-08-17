import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'

import Warband from 'fallingsky/pieces/warband'
import COINObject from 'common/coinObject'

describe("Warband", function () {
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

    it('serializes / deserializes', function () {
        const warband = belgae.removeWarbands(1)[0];
        warband.revealed(true);
        expect(warband.status()).to.equal('revealed');

        const json = warband.serialize();
        const restoredWarband = Warband.deserialize(json);
        expect(restoredWarband.status()).to.equal('revealed');
        const genericRestoredWarband = COINObject.deserialize(json);
        expect(genericRestoredWarband.status()).to.equal('revealed');

    });

});