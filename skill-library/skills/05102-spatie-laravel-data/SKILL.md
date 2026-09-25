---
name: spatie-laravel-data
description: Expert knowledge about the Spatie Laravel Data package (v4). Use when the user asks about laravel-data, Data objects, DTOs in Laravel, data transformation, validation with Data classes, lazy properties, Eloquent casting with Data, or TypeScript generation from PHP data objects.
---

# Spatie Laravel Data (v4)

Comprehensive reference for `spatie/laravel-data`. Answer questions, generate code, explain concepts, and guide implementation decisions based on the documentation below.

**Docs**: https://spatie.be/docs/laravel-data/v4/introduction

---

## What is Laravel Data?

Laravel Data lets you create rich, typed **Data Objects** that replace multiple layers at once: API resources, form request validation, DTOs, and TypeScript type definitions — all from a single class definition.

```php
use Spatie\LaravelData\Data;

class SongData extends Data
{
    public function __construct(
        public string $title,
        public string $artist,
    ) {}
}
```

One class handles:
- Validation when creating from a request
- Transformation when returning from a controller
- Eloquent casting when stored in a model
- TypeScript generation for the frontend

---

## Installation

```bash
composer require spatie/laravel-data
```

---

## Creating Data Objects

### Constructor & basic usage

```php
$song = new SongData(title: 'Never Gonna Give You Up', artist: 'Rick Astley');
```

### `from()` — universal factory

```php
SongData::from(['title' => 'Never Gonna Give You Up', 'artist' => 'Rick Astley']);
SongData::from(Song::first());           // Eloquent model
SongData::from(request());              // Request (auto-validates)
SongData::from('{"title":"..."}');      // JSON string
SongData::from($otherSongData);         // Another Data object
```

### Magic creation methods

Define static `from*` methods for custom sources:

```php
class SongData extends Data
{
    public static function fromModel(Song $song): self
    {
        return new self(
            title: strtoupper($song->title),
            artist: $song->artist->name,
        );
    }
}

SongData::from(Song::first()); // automatically calls fromModel()
```

Magic methods bypass the pipeline and take precedence over normalizers.

### `prepareForPipeline()` — reshape payload before processing

```php
public static function prepareForPipeline(array $properties): array
{
    $properties['metadata'] = Arr::only($properties, ['release_year', 'producer']);
    return $properties;
}
```

### Collections

```php
SongData::collect(Song::all());                                          // array
SongData::collect(Song::all(), DataCollection::class);                   // DataCollection
SongData::collect(Song::paginate(), PaginatedDataCollection::class);     // paginated
SongData::collect(Song::cursorPaginate(), CursorPaginatedDataCollection::class);
```

### Empty blueprints (for frontend "create" forms)

```php
SongData::empty();                            // all properties → null/default
SongData::empty(['title' => 'Default']);      // override specific defaults
SongData::empty(only: ['title']);             // only certain properties
```

### Without validation

```php
SongData::withoutValidation()->from($array);
```

---

## As a DTO

### Nesting

Data objects compose naturally:

```php
class AlbumData extends Data
{
    public function __construct(
        public string $title,
        public ArtistData $artist,             // nested object — auto-cast from array
        /** @var SongData[] */
        public array $songs,                   // array of nested objects
        #[DataCollectionOf(SongData::class)]
        public DataCollection $songCollection, // typed DataCollection
    ) {}
}
```

Nested arrays are automatically cast to their `Data` types.

### Optional properties (partial updates / PATCH)

```php
use Spatie\LaravelData\Optional;

class UpdateSongData extends Data
{
    public function __construct(
        public string|Optional $title,
        public string|Optional $artist,
    ) {}
}

// Only provided fields are set; missing ones become Optional instances
UpdateSongData::from(['title' => 'New Title'])->title;  // 'New Title'
UpdateSongData::from(['title' => 'New Title'])->artist; // Optional instance
```

Check: `$data->artist instanceof Optional`

### Defaults

```php
class SongData extends Data
{
    public function __construct(
        public string $title,
        public string $status = 'draft',
    ) {}
}
```

### Casts

Built-in casts handle common types automatically. Custom cast:

```php
use Spatie\LaravelData\Casts\Cast;
use Spatie\LaravelData\Support\Creation\CreationContext;
use Spatie\LaravelData\Support\DataProperty;

class UpperCaseCast implements Cast
{
    public function cast(DataProperty $property, mixed $value, array $properties, CreationContext $context): string
    {
        return strtoupper($value);
    }
}
```

Apply:

```php
#[WithCast(UpperCaseCast::class)]
public string $title,
```

### Dates

Global format in `config/data.php`:

```php
'date_format' => DATE_ATOM,
// or multiple formats:
'date_format' => [DATE_ATOM, 'Y-m-d'],
```

Per-property:

```php
#[WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d')]
#[WithTransformer(DateTimeInterfaceTransformer::class, format: 'd-m-Y')]
public Carbon $releaseDate,

// Specific Carbon type
#[WithCast(DateTimeInterfaceCast::class, type: CarbonImmutable::class)]
public $date,

// Timezone conversion on cast (input)
#[WithCast(DateTimeInterfaceCast::class, timeZone: 'UTC')]
public DateTime $date,

// Timezone conversion on transform (output)
#[WithTransformer(DateTimeInterfaceTransformer::class, setTimeZone: 'Europe/Brussels')]
public DateTime $date,
```

---

## Validation

### Automatic rule inference from PHP types

| PHP type | Inferred rules |
|----------|---------------|
| `string` | `required\|string` |
| `?string` | `nullable\|string` |
| `int` | `required\|integer` |
| `float` | `required\|numeric` |
| `bool` | `required\|boolean` |
| `array` | `required\|array` |
| Nested `Data` class | `array` + all nested property rules |
| `Optional\|string` | `present` (only when field is sent) |

### Validation attributes

Apply directly to constructor properties:

```php
use Spatie\LaravelData\Attributes\Validation\{Max, Min, Rule, Unique, RequiredIf, Enum};

class SongData extends Data
{
    public function __construct(
        #[Max(100), Min(1)]
        public string $title,

        #[Rule('in:draft,published')]
        public string $status,

        #[Unique('songs', 'title')]
        public string $uniqueTitle,

        #[RequiredIf('status', 'published')]
        public ?string $publishedAt,

        #[Enum(SongStatusEnum::class)]
        public string $enumStatus,
    ) {}
}
```

#### Full list of available validation attributes

| Attribute | Notes |
|-----------|-------|
| `Accepted` | yes/on/1/true |
| `AcceptedIf(field, value)` | |
| `ActiveUrl` | |
| `After(date)` | date string, Carbon, or `FieldReference` |
| `AfterOrEqual(date)` | |
| `Alpha` | |
| `AlphaDash` | |
| `AlphaNumeric` | |
| `ArrayType(...keys)` | optional: valid keys |
| `Bail` | stop on first failure |
| `Before(date)` | |
| `BeforeOrEqual(date)` | |
| `Between(min, max)` | |
| `BooleanType` | |
| `Confirmed` | needs `field_confirmation` input |
| `CurrentPassword(?guard)` | |
| `Date` | |
| `DateEquals(date)` | |
| `DateFormat(format)` | |
| `Declined` | no/off/0/false |
| `DeclinedIf(field, value)` | |
| `Different(field)` | |
| `Digits(count)` | exact digit count |
| `DigitsBetween(min, max)` | |
| `Dimensions(ratio, maxWidth, maxHeight)` | images |
| `Distinct(?Strict\|IgnoreCase)` | array elements must be unique |
| `DoesntEndWith(...values)` | |
| `DoesntStartWith(...values)` | |
| `Email(...modes)` | optional: RFC, DNS checks |
| `EndsWith(...values)` | |
| `Enum(EnumClass::class, only: [], except: [])` | |
| `ExcludeIf(field, value)` | |
| `ExcludeUnless(field, value)` | |
| `ExcludeWith(field)` | |
| `ExcludeWithout(field)` | |
| `Exists(table, column, connection, withoutTrashed)` | |
| `File` | |
| `Filled` | not empty when present |
| `GreaterThan(field\|value)` | |
| `GreaterThanOrEqualTo(field\|value)` | |
| `Image` | |
| `In(...values)` | |
| `InArray(field)` | must exist in array of another field |
| `IntegerType` | |
| `IP` | |
| `IPv4` | |
| `IPv6` | |
| `Json` | |
| `LessThan(field\|value)` | |
| `LessThanOrEqualTo(field\|value)` | |
| `ListType` | sequential array |
| `Lowercase` | |
| `MacAddress` | |
| `Max(value)` | |
| `MaxDigits(count)` | |
| `MimeTypes(...types)` | |
| `Mimes(...extensions)` | |
| `Min(value)` | |
| `MinDigits(count)` | |
| `MultipleOf(divisor)` | |
| `NotIn(...values)` | |
| `NotRegex(pattern)` | |
| `Nullable` | |
| `Numeric` | |
| `Password(min, letters, mixedCase, numbers, symbols, uncompromised, threshold)` | |
| `Present` | |
| `Prohibited` | must not be present |
| `ProhibitedIf(field, value)` | |
| `ProhibitedUnless(field, value)` | |
| `Prohibits(...fields)` | |
| `Regex(pattern)` | |
| `Required` | |
| `RequiredIf(field, value)` | |
| `RequiredUnless(field, value)` | |
| `RequiredWith(...fields)` | |
| `RequiredWithAll(...fields)` | |
| `RequiredWithout(...fields)` | |
| `RequiredWithoutAll(...fields)` | |
| `RequiredArrayKeys(...keys)` | |
| `Rule(string\|array)` | custom rule string or array |
| `Same(field)` | |
| `Size(value)` | |
| `Sometimes` | validate only when present |
| `StartsWith(...values)` | |
| `StringType` | |
| `TimeZone` | |
| `Unique(table, column, connection, withoutTrashed, ignore)` | |
| `Ulid` | |
| `Uppercase` | |
| `Url(...schemes)` | |
| `Uuid` | |

#### Dynamic references in attributes

```php
use Spatie\LaravelData\Attributes\Validation\{Unique, RouteParameterReference, AuthenticatedUserReference, FieldReference};

#[Unique('songs', ignore: new RouteParameterReference('song'))]
public string $title,

#[Unique('songs', ignore: new AuthenticatedUserReference())]
public string $title,

#[After(new FieldReference('start_date'))]
public Carbon $end_date,
```

### Manual rules method

```php
class SongData extends Data
{
    public static function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:100'],
        ];
    }
}
```

### Authorization

```php
public static function authorize(): bool
{
    return auth()->user()->isAdmin();
}
```

### Nested validation rules

Nested `Data` objects automatically generate dot-notation rules:

```php
// AlbumData with nested ArtistData generates:
[
    'title'       => ['required', 'string'],
    'artist'      => ['array'],
    'artist.name' => ['required', 'string'],
    'artist.age'  => ['required', 'integer'],
]

// Nullable nested: rules only expand when payload is provided
// ?ArtistData + no value → ['artist' => ['nullable']]
// ?ArtistData + [] provided → full dot-notation rules

// Array of Data objects uses NestedRules:
[
    'songs' => ['present', 'array', new NestedRules()],
]
```

### Skipping validation

```php
SongData::withoutValidation()->from($array);
```

---

## As a Resource (API Output)

### Basic controller usage

```php
class SongController
{
    public function show(Song $song): SongData
    {
        return SongData::from($song);
        // JSON response, 200 for GET, 201 for POST automatically
    }

    public function index()
    {
        return SongData::collect(Song::all());
    }

    public function paginated()
    {
        return SongData::collect(Song::paginate(), PaginatedDataCollection::class);
    }
}
```

### Form Request in one step (no separate FormRequest needed)

```php
// Route: POST /songs
public function store(SongData $data): SongData
{
    // $data is validated and typed — ready to use
    $song = Song::create($data->toArray());
    return SongData::from($song);
}
```

### Property mapping (rename output keys)

```php
use Spatie\LaravelData\Attributes\{MapOutputName, MapInputName, MapName};

class SongData extends Data
{
    public function __construct(
        #[MapOutputName('song_title')]    // output key differs from property name
        public string $title,

        #[MapInputName('song_artist')]    // input key differs from property name
        public string $artist,

        #[MapName('track_number')]        // both input and output
        public int $trackNumber,
    ) {}
}
```

### Transformers

```php
// Local transformer
#[WithTransformer(DateTimeInterfaceTransformer::class, format: 'm-Y')]
public Carbon $birth_date,

// Built-in transformers:
// - DateTimeInterfaceTransformer — Carbon, DateTime, DateTimeImmutable
// - ArrayableTransformer         — Arrayable objects

// Global transformers in config/data.php:
'transformers' => [
    DateTimeInterface::class => DateTimeInterfaceTransformer::class,
    Arrayable::class         => ArrayableTransformer::class,
],
```

Advanced transformation context:

```php
$data->transform(
    TransformationContextFactory::create()
        ->withoutValueTransformation()
        ->withoutPropertyNameMapping()
        ->withWrapping()
        ->maxDepth(20)
        ->withGlobalTransformer('string', StringToUpperTransformer::class)
);
```

Max depth config (`data.php`):

```php
'max_transformation_depth'               => 20,
'throw_when_max_transformation_depth_reached' => true,
```

### `Resource` class (output-only, skips validation)

```php
use Spatie\LaravelData\Resource;

class SongResource extends Resource
{
    public function __construct(
        public string $title,
        public string $artist,
    ) {}
}
```

Use when an object is only returned, never created from input — better performance.

### Convert to array / JSON

```php
$data->toArray();   // transformed array (respects transformers, mapping)
$data->toJson();    // JSON string
$data->all();       // all properties, including all lazy (forced)
```

### Wrapping

```php
// Instance
SongData::from($song)->wrap('data');

// Class default
class SongData extends Data
{
    public function defaultWrap(): string { return 'data'; }
}

// Global (config/data.php)
'wrap' => 'data',

// Opt out
SongData::from($song)->withoutWrapping();

// Collections (DataCollection only, not plain arrays)
SongData::collect(Song::all(), DataCollection::class)->wrap('data');
SongData::collect(Song::paginate(), PaginatedDataCollection::class)->wrap('data');
```

Note: Wrapping only applies when returning as HTTP response, not on `toArray()`/`toJson()`.

---

## Lazy Properties

Defer properties until explicitly requested to reduce payload size.

### Basic lazy

```php
use Spatie\LaravelData\Lazy;

class AlbumData extends Data
{
    public function __construct(
        public string $title,
        public Lazy|Collection $songs,
    ) {}

    public static function fromModel(Album $album): self
    {
        return new self(
            title: $album->title,
            songs: Lazy::create(fn() => SongData::collect($album->songs)),
        );
    }
}
```

### Including lazy properties

```php
AlbumData::fromModel($album)->include('songs');
AlbumData::fromModel($album)->include('songs.title', 'songs.artist');
AlbumData::fromModel($album)->include('songs.{title,artist}');
AlbumData::fromModel($album)->include('songs.*');     // all nested
```

### Permanent inclusion

```php
$data->includePermanently('songs');

// Or in the class:
protected function includeProperties(): array
{
    return ['songs'];
}
```

### Lazy types

```php
// Conditional
Lazy::when(fn() => auth()->user()->isAdmin(), fn() => $sensitiveData)

// Relational (avoids N+1 — only includes when relation is already loaded)
Lazy::whenLoaded('songs', $album, fn() => SongData::collect($album->songs))
```

### Via query string (`?include=songs`)

```php
class AlbumData extends Data
{
    public static function allowedRequestIncludes(): ?array
    {
        return ['songs'];   // null = allow all
    }
}
```

### `#[AutoLazy]` attribute

```php
#[AutoLazy]
class AlbumData extends Data
{
    // All castable properties are automatically wrapped in Lazy
}
```

### Excluding properties

```php
$data->exclude('sensitiveField');
$data->only('title', 'artist');
```

---

## Eloquent Casting

Store typed Data objects directly on Eloquent models (serialized as JSON):

```php
class Song extends Model
{
    protected $casts = [
        'artist'   => ArtistData::class,
        'metadata' => SongMetaData::class,
    ];
}

// Both work for writing:
Song::create(['artist' => new ArtistData(name: 'Rick Astley', age: 22)]);
Song::create(['artist' => ['name' => 'Rick Astley', 'age' => 22]]);

// Always typed when reading:
$song->artist->name; // "Rick Astley"
```

### Collections on models

```php
protected $casts = [
    'songs' => DataCollection::class.':'.SongData::class,
];
```

### Default values for null columns

```php
// Add `:default` to cast parameter to use property defaults when DB value is null
protected $casts = [
    'config' => ConfigData::class.':default',
];
```

### Encryption

```php
protected $casts = [
    'sensitive' => SensitiveData::class.',encrypted',
];
```

### Polymorphic (abstract) Data classes

```php
// Stored as: {"type": "\\App\\Data\\CdRecordConfig", "data": {...}}

// Configure morph map (avoids breaking on class rename):
app(DataConfig::class)->enforceMorphMap([
    'cd_record_config'    => CdRecordConfig::class,
    'vinyl_record_config' => VinylRecordConfig::class,
]);
```

---

## TypeScript Generation

Requires `spatie/laravel-typescript-transformer`.

### Mark classes for transformation

```php
use Spatie\LaravelData\Attributes\TypeScript;

#[TypeScript]
class SongData extends Data
{
    public function __construct(
        public string $title,
        public int $year,
        public bool $is_published,
        public ?string $description,
    ) {}
}
```

Or docblock: `/** @typescript */`

### Auto-collect all Data objects

In `config/typescript-transformer.php`:

```php
'collectors' => [
    Spatie\LaravelData\Support\TypeScriptTransformer\DataTypeScriptCollector::class,
],
```

### Generate

```bash
php artisan typescript:transform
```

### PHP → TypeScript type mapping

| PHP | TypeScript |
|-----|-----------|
| `string` | `string` |
| `int` / `float` | `number` |
| `bool` | `boolean` |
| `array` | `Array` |
| `?T` | `T \| null` |
| `Lazy\|T` or `Optional\|T` | `T?` (optional) |
| Nested `Data` class | Corresponding TS interface |

Note: If both packages define `Optional`, alias one: `use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;`

---

## Inertia Integration

```php
// Basic
return Inertia::render('Song', SongData::from($song));

// With Inertia-specific lazy types
class SongData extends Data
{
    public function __construct(
        #[AutoInertiaLazy]       // never on first load, optional on partial reload
        public Lazy|string $title,
        #[AutoClosureLazy]       // always on first load, optional on partial reload
        public Lazy|string $artist,
        #[AutoInertiaDeferred]   // deferred load, optional on partial reload
        public Lazy|string $lyrics,
    ) {}
}

// Group deferred properties to load together
Lazy::inertiaDeferred(fn() => $song->artist, group: 'details')
Lazy::inertiaDeferred(fn() => $song->lyrics, group: 'details')
```

Client-side partial reload:

```js
router.reload({ only: ['title'] });
```

---

## Normalizers

Normalizers convert an input value into an array before the pipeline runs. Built-in:

| Normalizer | Handles |
|-----------|---------|
| `ModelNormalizer` | Eloquent models |
| `ArrayableNormalizer` | `Arrayable` implementations |
| `ObjectNormalizer` | `stdObject` instances |
| `ArrayNormalizer` | plain arrays |
| `JsonNormalizer` | JSON strings |
| `FormRequestNormalizer` | FormRequest (uses `validated()`) |

Custom normalizer:

```php
use Spatie\LaravelData\Normalizers\Normalizer;

class MyNormalizer implements Normalizer
{
    public function normalize(mixed $value): ?array
    {
        if (! $value instanceof MySpecialClass) {
            return null;
        }
        return $value->toDataArray();
    }
}
```

Register globally in `config/data.php` or per class:

```php
public static function normalizers(): array
{
    return [
        ModelNormalizer::class,
        MyNormalizer::class,
        ArrayNormalizer::class,
    ];
}
```

---

## Pipeline

The creation pipeline processes input in this order:

1. **AuthorizedDataPipe** — check authorization
2. **MapPropertiesDataPipe** — translate property names
3. **FillRouteParameterPropertiesDataPipe** — populate from route params
4. **ValidatePropertiesDataPipe** — validate
5. **DefaultValuesDataPipe** — apply defaults
6. **CastPropertiesDataPipe** — cast to correct types

Custom pipeline:

```php
public static function pipeline(): DataPipeline
{
    return DataPipeline::create()
        ->into(static::class)
        ->through(AuthorizedDataPipe::class)
        ->through(MapPropertiesDataPipe::class)
        ->through(ValidatePropertiesDataPipe::class)
        ->through(DefaultValuesDataPipe::class)
        ->through(CastPropertiesDataPipe::class);
}

// Prepend to parent pipeline
public static function pipeline(): DataPipeline
{
    return parent::pipeline()->firstThrough(MyCustomPipe::class);
}
```

Custom pipe interface:

```php
interface DataPipe
{
    public function handle(
        mixed $payload,
        DataClass $class,
        array $properties,
        CreationContext $creationContext
    ): array;
}
```

---

## Performance

### Cache data structures for production

Eliminate reflection overhead:

```bash
php artisan data:cache-structures
```

Config (`data.php`):

```php
'structure_caching' => [
    'enabled'   => true,
    'cache'     => [
        'store'  => 'redis',
        'prefix' => 'laravel-data',
    ],
    'directories' => [
        app_path('Data'),
    ],
],
```

Cache is **automatically disabled during tests**.

### Other tips

- Use `Resource` instead of `Data` for output-only classes (skips validation/authorization).
- Use `Lazy::whenLoaded()` on relations to prevent N+1 queries.
- Use `#[AutoLazy]` on heavy classes to skip loading expensive relations by default.
- Configure morph maps in production to decouple from class names.
- Specify `directories` in `structure_caching` to limit discovery scope.
