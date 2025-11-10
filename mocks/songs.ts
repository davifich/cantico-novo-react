import { Music } from '@/types/music';

export const mockSongs: Music[] = [
  {
    id: '1',
    title: 'Amazing Grace',
    artist: 'John Newton',
    letra: `Amazing grace how sweet the sound
That saved a wretch like me
I once was lost, but now I'm found
Was blind, but now I see

'Twas grace that taught my heart to fear
And grace my fears relieved
How precious did that grace appear
The hour I first believed`,
    cifra: `[G]Amazing [C]grace how [G]sweet the [D]sound
That [G]saved a [C]wretch like [G]me [D]
I [G]once was [C]lost, but [G]now I'm [Em]found
Was [C]blind, but [G]now I [D]see [G]`,
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
    categories: ['traditional', 'worship'],
  },
  {
    id: '2',
    title: 'How Great Thou Art',
    artist: 'Carl Boberg',
    letra: `O Lord my God, when I in awesome wonder
Consider all the worlds Thy hands have made
I see the stars, I hear the rolling thunder
Thy power throughout the universe displayed

Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art`,
    cifra: `[C]O Lord my [F]God, when I in [C]awesome wonder
Consider [G]all the worlds Thy hands have [C]made
I see the [F]stars, I hear the [C]rolling thunder
Thy power through[G]out the universe dis[C]played`,
    createdAt: '2025-01-05T14:30:00Z',
    updatedAt: '2025-01-05T14:30:00Z',
    categories: ['worship', 'praise'],
  },
  {
    id: '3',
    title: 'Cornerstone',
    artist: 'Hillsong',
    letra: `My hope is built on nothing less
Than Jesus' blood and righteousness
I dare not trust the sweetest frame
But wholly trust in Jesus' name

Christ alone, Cornerstone
Weak made strong in the Savior's love
Through the storm, He is Lord
Lord of all`,
    cifra: `[G]My hope is built on [D]nothing less
Than [Em]Jesus' blood and [C]righteousness
I [G]dare not trust the [D]sweetest frame
But [Em]wholly trust in [C]Jesus' name

[G]Christ alone, [D]Cornerstone
[Em]Weak made strong in the [C]Savior's love`,
    createdAt: '2025-01-10T09:15:00Z',
    updatedAt: '2025-01-10T09:15:00Z',
    categories: ['contemporary', 'worship'],
  },
  {
    id: '4',
    title: 'Great Is Thy Faithfulness',
    artist: 'Thomas Chisholm',
    letra: `Great is Thy faithfulness, O God my Father
There is no shadow of turning with Thee
Thou changest not, Thy compassions they fail not
As Thou hast been, Thou forever wilt be

Great is Thy faithfulness
Great is Thy faithfulness
Morning by morning new mercies I see`,
    cifra: `[D]Great is Thy [A]faithfulness, O [D]God my [G]Father
[D]There is no [Em]shadow of [A]turning with [D]Thee
Thou [G]changest not, Thy com[D]passions they [Bm]fail not
As [Em]Thou hast been, Thou for[A]ever wilt [D]be`,
    createdAt: '2025-01-15T16:45:00Z',
    updatedAt: '2025-01-15T16:45:00Z',
    categories: ['traditional', 'hymns'],
  },
  {
    id: '5',
    title: 'Oceans (Where Feet May Fail)',
    artist: 'Hillsong United',
    letra: `You call me out upon the waters
The great unknown where feet may fail
And there I find You in the mystery
In oceans deep, my faith will stand

And I will call upon Your name
And keep my eyes above the waves
When oceans rise, my soul will rest in Your embrace
For I am Yours and You are mine`,
    cifra: `[Bm]You call me [A]out upon the [D]waters
The great un[A]known where [G]feet may fail
[Bm]And there I [A]find You in the [D]mystery
In oceans [A]deep, my [G]faith will stand`,
    createdAt: '2025-01-20T11:20:00Z',
    updatedAt: '2025-01-20T11:20:00Z',
    categories: ['contemporary', 'worship', 'praise'],
  },
  {
    id: '6',
    title: 'Holy, Holy, Holy',
    artist: 'Reginald Heber',
    letra: `Holy, holy, holy! Lord God Almighty
Early in the morning our song shall rise to Thee
Holy, holy, holy! Merciful and mighty
God in three persons, blessed Trinity

Holy, holy, holy! All the saints adore Thee
Casting down their golden crowns around the glassy sea`,
    cifra: `[D]Holy, holy, [A]holy! Lord [D]God Al[G]mighty
[D]Early in the [Em]morning our [A]song shall rise to [D]Thee
Holy, holy, [A]holy! Mer[D]ciful and [Bm]mighty
[G]God in three [D]persons, [A]blessed Trin[D]ity`,
    createdAt: '2025-01-25T08:00:00Z',
    updatedAt: '2025-01-25T08:00:00Z',
    categories: ['traditional', 'hymns', 'worship'],
  },
  {
    id: '7',
    title: 'What a Beautiful Name',
    artist: 'Hillsong Worship',
    letra: `You were the Word at the beginning
One with God the Lord Most High
Your hidden glory in creation
Now revealed in You our Christ

What a beautiful Name it is
What a beautiful Name it is
The Name of Jesus Christ my King`,
    cifra: `[D]You were the [A]Word at the be[Bm]ginning
One with [G]God the Lord Most [D]High
Your hidden [A]glory in cre[Bm]ation
Now re[G]vealed in You our [D]Christ

What a beautiful [A]Name it [Bm]is
What a beautiful [G]Name it [D]is`,
    createdAt: '2025-01-28T13:30:00Z',
    updatedAt: '2025-01-28T13:30:00Z',
    categories: ['contemporary', 'worship', 'praise'],
  },
  {
    id: '8',
    title: 'It Is Well With My Soul',
    artist: 'Horatio Spafford',
    letra: `When peace like a river attendeth my way
When sorrows like sea billows roll
Whatever my lot, Thou hast taught me to say
It is well, it is well with my soul

It is well with my soul
It is well, it is well with my soul`,
    cifra: `[C]When peace like a [F]river at[C]tendeth my way
When [G]sorrows like sea billows [C]roll
What[F]ever my [C]lot, Thou hast [Am]taught me to say
It is [G]well, it is [C]well with my soul`,
    createdAt: '2025-02-01T10:45:00Z',
    updatedAt: '2025-02-01T10:45:00Z',
    categories: ['traditional', 'hymns'],
  },
  {
    id: '9',
    title: 'Reckless Love',
    artist: 'Cory Asbury',
    letra: `Before I spoke a word, You were singing over me
You have been so, so good to me
Before I took a breath, You breathed Your life in me
You have been so, so kind to me

Oh, the overwhelming, never-ending, reckless love of God
Oh, it chases me down, fights 'til I'm found, leaves the ninety-nine
I couldn't earn it, I don't deserve it, still You give Yourself away
Oh, the overwhelming, never-ending, reckless love of God`,
    cifra: `[D]Before I spoke a word, You were [A]singing over me
[Bm]You have been so, so [G]good to me
[D]Before I took a breath, You breathed Your [A]life in me
[Bm]You have been so, so [G]kind to me

[D]Oh, the overwhelming, never-ending, [A]reckless love of God
[Bm]Oh, it chases me down, fights 'til I'm [G]found, leaves the ninety-nine`,
    createdAt: '2025-02-03T15:20:00Z',
    updatedAt: '2025-02-03T15:20:00Z',
    categories: ['contemporary', 'worship'],
  },
  {
    id: '10',
    title: 'Blessed Assurance',
    artist: 'Fanny Crosby',
    letra: `Blessed assurance, Jesus is mine
Oh, what a foretaste of glory divine
Heir of salvation, purchase of God
Born of His Spirit, washed in His blood

This is my story, this is my song
Praising my Savior all the day long
This is my story, this is my song
Praising my Savior all the day long`,
    cifra: `[D]Blessed assurance, [G]Jesus is [D]mine
Oh, what a [A]foretaste of [D]glory divine
[D]Heir of sal[G]vation, pur[D]chase of God
Born of His [A]Spirit, washed in His [D]blood

This is my [G]story, this is my [D]song
Praising my [A]Savior all the day [D]long`,
    createdAt: '2025-02-05T09:00:00Z',
    updatedAt: '2025-02-05T09:00:00Z',
    categories: ['traditional', 'hymns'],
  },
  {
    id: '11',
    title: 'Way Maker',
    artist: 'Sinach',
    letra: `You are here, moving in our midst
I worship You, I worship You
You are here, working in this place
I worship You, I worship You

Way Maker, Miracle Worker, Promise Keeper
Light in the darkness, my God, that is who You are
Way Maker, Miracle Worker, Promise Keeper
Light in the darkness, my God, that is who You are`,
    cifra: `[C]You are here, moving in our [G]midst
I [Am]worship You, I [F]worship You
[C]You are here, working in this [G]place
I [Am]worship You, I [F]worship You

[C]Way Maker, Miracle [G]Worker, Promise [Am]Keeper
Light in the [F]darkness, my God, that is who You are`,
    createdAt: '2025-02-07T14:30:00Z',
    updatedAt: '2025-02-07T14:30:00Z',
    categories: ['contemporary', 'worship', 'praise'],
  },
  {
    id: '12',
    title: 'Goodness of God',
    artist: 'Bethel Music',
    letra: `I love You Lord, oh Your mercy never fails me
All my days, I've been held in Your hands
From the moment that I wake up, until I lay my head
Oh, I will sing of the goodness of God

All my life You have been faithful
All my life You have been so, so good
With every breath that I am able
Oh, I will sing of the goodness of God`,
    cifra: `[C]I love You Lord, oh Your [G]mercy never fails me
[Am]All my days, I've been [F]held in Your hands
[C]From the moment that I wake up, [G]until I lay my head
[Am]Oh, I will sing of the [F]goodness of God

[C]All my life You have been [G]faithful
[Am]All my life You have been [F]so, so good`,
    createdAt: '2025-02-09T11:15:00Z',
    updatedAt: '2025-02-09T11:15:00Z',
    categories: ['contemporary', 'worship'],
  },
] as const;