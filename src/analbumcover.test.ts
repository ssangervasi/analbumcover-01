import {
	clean,
	rephrase,
	initialRephrasing,
	eachSlice
 } from './analbumcover'

import { initNodehun, NodehunSpelling, Spelling } from './spelling';

async function nodehunSpelling() {
	return initNodehun().then(nodehun => (new NodehunSpelling(nodehun)))
}

describe('rephrase', () => {
	test('numeric input', () => {
		const albumName = '1999'
		const rephrased = rephrase(
			albumName,
			{
				isCorrect() { return true; }
			}
		)
		expect(rephrased).toEqual(null);
	});

	test('input that could be interpreted differently', async () => {
		const spelling = await nodehunSpelling();

		const anAlbumCover = 'an album cover';
		const analBumCover = rephrase(anAlbumCover, spelling, 3);

		expect(analBumCover).toEqual('anal bum cover');
	});

	test('it does not return anything if the minimum word-length is onerous', async () => {
		const spelling = await nodehunSpelling();
		const rephrased = rephrase('the pen is mightier', spelling, 4)
		expect(rephrased).toEqual(null);
	});

	test('it does not return the input phrase', function() {
		const spelling: Spelling = {
			isCorrect() {
				return true;
			}
		};

		const pancake: string = 'pancake';
		const rephrased = rephrase(pancake, spelling, 7);
		expect(rephrased).toEqual(null);
	});

	test('it splits valid words if allowed', async() => {
		const spelling = await nodehunSpelling();
		const rephrased = rephrase('ape tit', spelling, 1);
		expect(rephrased).toEqual('a pet it')
	})

	test('it merges shorter words when forced to', async () => {
		const spelling = await nodehunSpelling();
		const panCake = rephrase('pan cake', spelling, 4);
		expect(panCake).toEqual('pancake');
	});

	test('it scrubs bad input', async () => {
		const spelling = await nodehunSpelling();
		expect(rephrase('f_a_cEb.o0ok', spelling, 4)).toEqual('face book')
	})
});

describe('clean', () => {
	test('it downcases capitals', () => {
		expect(clean('DMSR')).toEqual('dmsr');
	});
	
	test('it strips numerics', () => {
		expect(clean('2nite')).toEqual('nite');
	});
	
	test('it strips underscores', () => {
		expect(clean('d_m_s_r')).toEqual('dmsr');
	});
	
	test('it strips many other things', () => {
		expect(clean('!!.*(&@)#(*')).toEqual('');
	});

	test('it retains spaces', () => {
		expect(clean('f  u u')).toEqual('f  u u');
	});
})

describe ('initialRephrasing', () => {
	test('returns only alphabetic characters in an array', () => {
		expect(
			initialRephrasing('"D.M.S.R." (1982)')
		).toEqual({
			unusedChars: ['D', 'M', 'S', 'R'],
			usedWords: []
		});
	});
});

describe('eachSlice', function() {
	test("empty arrays don't trigger a callback", () => {
		expect.assertions(0);
		eachSlice([], () => {
			expect(true);
		});
	});

	test('it accepts increasingly large subslices of the items', () => {
		let sliceCount = 0;
		const arr = ['d', 'm', 's', 'r'];

		eachSlice(arr, (slice, other) => {
			expect(slice).toEqual(arr.slice(0, ++sliceCount))
			expect(other).toEqual(arr.slice(sliceCount))
		})
	});
});