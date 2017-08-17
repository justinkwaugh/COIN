import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'

import TurnContext from 'common/turnContext';

describe("TurnContext", function () {
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
        const turnContext = new TurnContext();
        turnContext.context.warbands = belgae.removeWarbands(2);
        turnContext.context.alliedTribe = belgae.removeAlliedTribe();
        turnContext.context.plainObject = { a: 'b'};
        turnContext.context.stringVal = 'abc';
        const id = turnContext.id;
        const json = turnContext.serialize();
        const restoredTurnContext = TurnContext.deserialize(json);
        expect(restoredTurnContext.id).to.equal(id);
        expect(restoredTurnContext.context.warbands.length).to.equal(2);
        expect(restoredTurnContext.context.warbands[0].status()).to.equal('hidden');
        expect(restoredTurnContext.context.alliedTribe.factionId).to.equal(belgae.id);
        expect(restoredTurnContext.context.plainObject.a).to.equal('b');
        expect(restoredTurnContext.context.stringVal).to.equal('abc');
    });

});