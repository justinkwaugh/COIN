import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'

import AlliedTribe from 'fallingsky/pieces/alliedTribe'
import TribeIDs from 'fallingsky/config/tribeIds'
import COINObject from 'common/coinObject'

describe("AlliedTribe", function () {
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
        const mandubii = state.tribesById[TribeIDs.MANDUBII];
        const ally = belgae.removeAlliedTribe();
        mandubii.makeAllied(ally);
        expect(ally.tribeId).to.equal(TribeIDs.MANDUBII);

        const json = ally.serialize();
        const restoredAlly = AlliedTribe.deserialize(json);
        expect(restoredAlly.tribeId).to.equal(TribeIDs.MANDUBII);
        const genericRestoredAlly = COINObject.deserialize(json);
        expect(genericRestoredAlly.tribeId).to.equal(TribeIDs.MANDUBII);

    });

});