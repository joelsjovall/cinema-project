# Dyndata: Extremely dynamic C#
© ironboy/NodeHill 2024

## About Dyndata
>Start by [installing the Nuget package](https://www.nuget.org/packages/Dyndata) in your project!

>To make all Dyndata methods available everywhere, include these two lines in any file in your project:
>
>```cs
>global using Dyndata;
>global using static Dyndata.Factory;
>```

Dyndata is a C# library, that works with C# version 12.0 and upwards. It makes handling objects and arrays/lists in C# a lot easier and more dynamic. It is inspired by how objects and arrays work in JavaScript and TypeScript and is highly opinionated, based on these assumptions:
* It should be easy to add new properties to a generic object.
* There should be an abundance of convenient methods that let you manipulate arrays/list in different ways - using them as queues, mixing different types in a list etc.
* Spreads, the ability to use data from one data structure as a base for another, should be easy to use. Not only for arrays, but also for objects.
* It should be easy to log things in a human readable format. Dyndata lets you log data structures in a jsonesque format, with syntax highlightning.
* Although C# LINQ offers a lot of potential for functional programming its methods are often akwardly named compared to other languages - why Select instead of Map, why Where instead of Filter, why Aggregate instead of Reduce etc? So Dyndata gives you similar methods, but better named and often with more options.

## Log: A nice logger
The Log function lets you log all types of data  in a nice and easy way. It outputs arrays and objects in a jsonesque format.

Log also applies some syntax highlightning to help you see the difference between strings, numbers, booleans and property names in objects.

#### Syntax
```cs
Log(arg1)
Log(arg1, arg2)
Log(arg1 arg2, /* …, */ argN)
```

**Note:** An argument can be anything you want to log to the console. A space is inserted between each argument.

#### Options
```cs
LogHighlight = false;    // Turns off syntax highlighting
LogExtraNewline = false; // Turns off an extra new line after each log
```
**Note**: Different consoles have varied support for colors. If colors look odd or you see color codes instead of colors - turn off the syntax highlighting!

#### Example
```cs
var aNumber = 1.3;
var aString = "Hello!";
var aBoolean = true;
var anArray = Arr(1, "two", true);
var anObject = Obj(new { name = "Ann", age = 30, cool = true });

Log("This is a number", aNumber);
Log("This is a string", aString);
Log("This is a boolean", aBoolean);
Log("This is an array", anArray);
Log("This is an object", anObject);
```

#### Expected output
![Expected output of the logging in the example above](https://raw.githubusercontent.com/ironboy/Dyndata/main/documentation-website/www/log-example.gif)

## JSON: Stringify and Parse
Dyndata has an built in JSON stringifier and JSON parser.

#### JSON.Stringify(data)
Stringifies a data structure to JSON.

#### JSON.Parse(stringOfJson)
Parses a JSON string into a data structure. The JSON parser tries to convert all object-like structures into Obj instances and all array-like structures into Arr instances.

#### Example

```cs
var data = new Obj(new
{
    name = "Jane",
    hobbies = Arr("fishing", "football"),
});

var json = JSON.Stringify(data);

Log(json);
// Expected output (a string)
// {"name":"Jane","hobbies":["fishing","football"]}

var dataFromJson = JSON.Parse(json);

Log(dataFromJson);
// Expected output (an object):
// { "name": "Jane", "hobbies": ["fishing", "football"] }
```

## Obj: Smart objects
The Obj class let us create smart expandable objects where you can add and delete properties of any type as you go.

In the example below we:
* create an object
* add properties to it (using dot notation and using square bracket notation)
* change the value of properties
* read properties
* delete a property
* get a list of the object's keys (property names)
* get a list of the object's values (for all properties)
* get a list of keys and values

```cs
// Create a new object with the properties firstName and lastName
var eric = Obj(new { firstName = "Eric", lastName = "Smith" });

// Add a property to an object, using dot notation
// and add another one, using square bracket notation
eric.age = 35;
eric["isKind"] = true;

// Change the value of a property
eric.isKind = false;
eric["isKind"] = true;

// Read a property
Log(eric.firstName);     // Expected output: "Eric"
Log(eric["firstName"]);  // Expected output: "Eric"

Log(eric);
// Expected output:
// {"firstName": "Eric", "lastName": "Smith", "age": 35, "isKind": true}

// Delete a property
eric.Delete("lastName");

Log(eric);
// Expected output: {"firstName": "Eric", "age": 35, "isKind": true}

Log(eric.GetKeys());     // Expected output: ["firstName", "age", "isKind"]

Log(eric.GetValues());   // Expected output: ["Eric", 35, true]

Log(eric.GetEntries());
// Expected output: [ ["firstName", "Eric"], ["age", 35], ["isKind", true] ]
```

>**Note:** You can create an "empty" Obj, without any properties, like this: **var myObject = Obj()**.
>
>**Also note:** Usually dot notation is preferable when adding a property. But square bracket notation supports property names with spaces and other non-letter characters. You can also use a variable inside the square brackets, which can come in handy in some cases.

### Spread syntax with Obj instances
C# does not, as of yet, have a spread operator that works with objects. But Obj instances interprets all properties starting with "\_\_\_" (three underscores) as spread operators.

> **Note:**  Since you can't have several properties with the same name, but sometimes want to make several spreads into an object, just suffix the second, third (and so on) "spread property" with other characters. See the example below.

```cs
var ann = Obj(new { firstName = "Ann", lastName = "Adams" });

var work = Obj(new { jobTitle = "CEO", company = "Spreads Are Us" });

var hobbies = Obj(new
{
    hobbies = Arr("fishing", "football"),
    activityLevel = "high"
});

var allAboutAnn = Obj(new
{
    ___ = ann, ___2 = work,  ___3 = hobbies,  // three spreads
    lazy = false, stubborn = true             // other properties
});

Log(allAboutAnn);
/* Expected output:
{
    "firstName": "Ann",
    "lastName": "Adams",
    "jobTitle": "CEO",
    "company": "Spreads Are Us",
    "hobbies": ["fishing", "football"],
    "activityLevel": "high",
    "lazy": false,
    "stubborn": true
} */
```

## Arr: Smart arrays
The Arr class let us create expandable arrays/list that can contain a mix of data types if needed.

In the example below we:
* create an array
* check its length
* read elements from it using square bracket notation/indexes
* read elements from it using the At method
* add/push a new element at the end of the array
* loop throught the array using a foreach loop


```cs
var numbers = Arr(1, 2, 3, "four", 5.0);

// Check the length of an array
Log(numbers.Length);  // Expected output: 5

// Read elements using indexes
Log(numbers[0]);      // Expected output: 1
Log(numbers[3]);      // Expected output: "four"

// Read elements using "at"
// (negative indexes - starts from the end of the array)
Log(numbers.At(-1));  // Expected output: 5.0

// Add an element to the end of an array
numbers.Push("six");
Log(numbers);
// Expected output: [1, 2, 3, "four", 5.0, "six"]

// Use foreach to loop through an array
// (expected output: Each element of the array)
foreach (var item in numbers)
{
    Log(item);
}
```

>**Note:** You can create an "empty" Arr, without any elements, like this: **var myArray = Arr()**.
>
> **Also note:** There are much more to be learned about Arr:s. They have a lot of nice instance methods available, that you can read more about in this documentation.

### An Arr of Obj:s
A very common datastructure is an array of objects - when it comes to Dyndata this means an Arr of Obj:s.

Here is an example:

```cs
var dogs = new Arr(
    new { name = "Fido", age = 5, breed = "labrador" },
    new { name = "Cassie", age = 8, breed = "collie" },
    new { name = "Scooby", age = 7, breed = "Great Dane" }
);

// Change the name of the second dog
dogs[1].name = "Lassie";

Log(dogs[1].name);  // Expected output: "Lassie"

foreach (var dog in dogs)
{
    Log($"{dog.name} is a {dog.age} year old {dog.breed}.");
}
// Expected output:
// "Fido is a 5 year old labrador."
// "Lassie is a 8 year old collie."
// "Scooby is a 7 year old Great Dane."
```
>**Note**: Generic objects are automatically converted to Obj:s when put into an Arr.

### Spread syntax with Arr instances
C# has a spread operator for collections (.. - *two dots*) that you can combine with the collection expression ([] - *square brackets*). Since Arr instances can be created from collections, this is a simple way to combine two or more Arr:s into one:

```cs
var women = Arr("Anna", "Beth", "Cecilia");
var men = Arr("Art", "Bart", "Carl");

var people = Arr([.. women, .. men]);
Log(people);
// Expected output:
// ["Anna", "Beth", "Cecilia", "Art", "Bart", "Carl"]
```

### Arr.Length
The Length property of an Arr instance represents the number of elements in that array. The value is an integer that is always numerically greater than the highest index in the array.

#### Syntax when setting the Length
* Setting the length to a value smaller than the current length truncates the array — elements beyond the new length are deleted.
* Setting any array index beyond the current length extends the array — the length property is increased to reflect the new highest index. New elements with null values will be inserted.

#### Example
```cs
var arr = Arr(1, 2, 3);

Log(arr);         // [1, 2, 3]
Log(arr.Length);  // 3

arr.Length = 2;
Log(arr);         // [1, 2]

arr.Length = 5;
Log(arr);         // [1, 2, null, null, null]
```

### Arr.At()
The At() method of Arr instances takes an integer value and returns the item at that index, allowing for positive and negative integers. Negative integers count back from the last item in the array.

#### Syntax
```cs
At(index)
```

#### Example
```cs
var numbers = Arr(5, 12, 8, 130, 44);

Log(numbers[2]);     // Expected output: 8
Log(numbers.At(2));  // Expected output: 8

Log(numbers[-2]);    // Expected output: null
Log(numbers.At(-2)); // Expected output: 130
```

### Arr.With()
The With() method of Arr instances returns a new array with the element at the given index replaced with the given value. Negative integers count back from the last item in the array.

#### Syntax
```cs
With(index, newValue)
```

#### Example
```cs
var greetings = Arr("Hi", "Howdy", "Hello");

var newGreetings = greetings.With(1, "Yo");
var otherVariant = greetings.With(-1, "Top of the day");

Log(greetings);    // Expected output: ["Hi", "Howdy", "Hello"]
Log(newGreetings); // Expected output: ["Hi", "Yo", "Hello"]
Log(otherVariant); // Expected output: ["Hi", "Howdy", "Top of the day"]
```

### Arr.Includes()
The Includes() method of Arr instances determines whether an array includes a certain value among its entries, returning true or false as appropriate.

#### Syntax
```cs
Includes(searchElement);
Includes(searchElement, fromIndex);
```
*fromIndex* = index to start the search at.

#### Example
```cs
var numbers = Arr(1, 2, 3);

Log(numbers.Includes(2));       // Expected output: true

var pets = Arr("cat", "dog", "bat");

Log(pets.Includes("bat"));     // Expected output: true

Log(pets.Includes("at"));      // Expected output: false

Log(pets.Includes("cat", 1));  // Expected output: false

Log(pets.Includes("dog", 1));  // Expected output: true
```

### Arr.Contains()
The Contains() method of Arr instances determines whether an array includes a certain value among its entries, returning true or false as appropriate.

**Note:** Contains is *an alias* for Includes. They both work exactly the same.

#### Syntax
```cs
Contains(searchElement);
Contains(searchElement, fromIndex);
```
*fromIndex* = index to start the search at.

#### Example
```cs
var numbers = Arr(1, 2, 3);

Log(numbers.Contains(2));       // Expected output: true

var pets = Arr("cat", "dog", "bat");

Log(pets.Contains("bat"));     // Expected output: true

Log(pets.Contains("at"));      // Expected output: false

Log(pets.Contains("cat", 1));  // Expected output: false

Log(pets.Contains("dog", 1));  // Expected output: true
```

### Arr.IndexOf()
The IndexOf() method of Arr instances returns the first index at which a given element can be found in the array, or -1 if it is not present.

#### Syntax
```cs
IndexOf(searchElement)
IndexOf(searchElement, fromIndex)
```
*fromIndex* = index to start the search at.

#### Example
```cs
var beasts = Arr("ant", "bison", "camel", "duck", "bison");

Log(beasts.IndexOf("bison"));     // Expected output: 1

// Start from index 2
Log(beasts.IndexOf("bison", 2));  // Expected output: 4

Log(beasts.IndexOf("giraffe"));   // Expected output: -1
```

### Arr.LastIndexOf()
The LastIndexOf() method of Arr instances returns the last index at which a given element can be found in the array, or -1 if it is not present.

#### Syntax
```cs
LastIndexOf(searchElement)
LastIndexOf(searchElement, fromIndex)
```
The array is searched backwards, starting at *fromIndex* (if provided).

#### Examples
```cs
var animals = Arr("Dodo", "Tiger", "Penguin", "Dodo", "Pig");

Log(animals.LastIndexOf("Dodo", 4));  // Expected output: 3

Log(animals.LastIndexOf("Dodo", 2));  // Expected output: 0

Log(animals.LastIndexOf("Tiger"));    // Expected output: 1
```

### Arr.Pop()
The Pop() method of Arr instances removes the last element from an array and returns that element. This method changes the length of the array.

#### Example
```cs
var plants = Arr("broccoli", "cauliflower", "cabbage", "kale", "tomato");

Log(plants.Pop());
// Expected output: "tomato"

Log(plants);
// Expected output: ["broccoli", "cauliflower", "cabbage", "kale"]

plants.Pop();

Log(plants);
// Expected output: ["broccoli", "cauliflower", "cabbage"]
```

### Arr.Push()
The Push() method of Arr instances adds the specified elements to the end of an array and returns the new length of the array.

#### Example
```cs
var animals = Arr("pigs", "goats", "sheep");

var count = animals.Push("cows");

Log(count);
// Expected output: 4

Log(animals);
// Expected output: ["pigs", "goats", "sheep", "cows"]

animals.Push("chickens", "cats", "dogs");
Log(animals);
// Expected output:
// ["pigs", "goats", "sheep", "cows", "chickens", "cats", "dogs"]
```

### Arr.Shift()
The Shift() method of Arr instances removes the first element from an array and returns that removed element. This method changes the length of the array.

#### Example
```cs
var numbers = Arr(1, 2, 3);

var firstElement = numbers.Shift();

Log(numbers);        // Expected output: [2, 3]

Log(firstElement);  // Expected output: 1
```

### Arr.Unshift()
The Unshift() method of Arr instances adds the specified elements to the beginning of an array and returns the new length of the array.

#### Example
```cs
var numbers = Arr(1, 2, 3);

Log(numbers.Unshift(4, 5));   // Expected output: 5

Log(numbers);                // Expected output: [4, 5, 1, 2, 3]
```

### Arr.Slice()
The Slice() method of Arr instances returns a new Arr which is a shallow copy of a portion of the original, selected from start to end (end not included). Start and end represent the index of items. The original array will not be modified.

#### Syntax
```cs
Slice();
Slice(start);
Slice(start, end);
```
**Note:** Negative index counts back from the end of the array.

#### Example
```cs
var animals = Arr("ant", "bison", "camel", "duck", "elephant");

Log(animals.Slice(2));
// Expected output: ["camel", "duck", "elephant"]

Log(animals.Slice(2, 4));
// Expected output: ["camel", "duck"]

Log(animals.Slice(1, 5));
// Expected output: ["bison", "camel", "duck", "elephant"]

Log(animals.Slice(-2));
// Expected output: ["duck", "elephant"]

Log(animals.Slice(2, -1));
// Expected output: ["camel", "duck"]

Log(animals.Slice());
// Expected output: ["ant", "bison", "camel", "duck", "elephant"]
```

### Arr.Splice()
The Splice() method of Arr instances changes the contents of an array by removing or replacing existing elements and/or adding new elements in place. It returns a new Arr of the removed elements.

To create a new Arr with a segment removed and/or replaced without mutating the original array, use ToSpliced(). To access part of an array without modifying it, see Slice().

#### Syntax
```cs
Splice(start)
Splice(start, deleteCount)
Splice(start, deleteCount, item1)
Splice(start, deleteCount, item1, item2)
Splice(start, deleteCount, item1, item2, /* …, */ itemN)
```

**Note:** Negative index counts back from the end of the array.

#### Example
```cs
var months = Arr("Jan", "March", "April", "June");

// Inserts at index 1
months.Splice(1, 0, "Feb");

Log(months);
// Expected output: ["Jan", "Feb", "March", "April", "June"]

// Replaces 1 element at index 4
var removedItems = months.Splice(4, 1, "May");

Log(removedItems);  // Expected output: ["June"]

Log(months);
// Expected output: ["Jan", "Feb", "March", "April", "May"]
```

### Arr.ToSpliced()
The ToSpliced() method of Arr instances is the copying version of the splice() method. It returns a new Arr with some elements removed and/or replaced at a given index.

#### Syntax
```cs
ToSpliced(start)
ToSpliced(start, deleteCount)
ToSpliced(start, deleteCount, item1)
ToSpliced(start, deleteCount, item1, item2)
ToSpliced(start, deleteCount, item1, item2, /* …, */ itemN)
```

**Note:** Negative index counts back from the end of the array.

#### Example
```cs
var months = Arr("Jan", "Mar", "Apr", "May");

// Inserting an element at index 1
var months2 = months.ToSpliced(1, 0, "Feb");
Log(months2); // ["Jan", "Feb", "Mar", "Apr", "May"]

// Deleting two elements starting from index 2
var months3 = months2.ToSpliced(2, 2);
Log(months3); // ["Jan", "Feb", "May"]

// Replacing one element at index 1 with two new elements
var months4 = months3.ToSpliced(1, 1, "Feb", "Mar");
Log(months4); // ["Jan", "Feb", "Mar", "May"]

// Original array is not modified
Log(months); // ["Jan", "Mar", "Apr", "May"]
```

### Arr.Reverse()
The Reverse() method of Arr instances reverses an array in place and returns the reference to the same array, the first array element now becoming the last, and the last array element becoming the first.

To create a new Arr with the reversed element order, without mutating the original array, use ToReversed().

#### Example
```cs
var array = Arr("one", "two", "three");
Log("array", array);
// Expected output: array: ["one", "two", "three"]

var reversed = array.Reverse();
Log("reversed", array);
// Expected output: reversed: ["three", "two", "one"]

// Careful: Reverse is destructive - it changes the original array.
// (And reversed and array both point to the same object.)

Log("array", array);
// Expected output: array: ["three", "two", "one"]
```

### Arr.ToReversed()
The ToReversed() method of Arr instances is the copying counterpart of the reverse() method. It returns a new array with the elements in reversed order.

#### Example
```cs
var items = Arr(1, 2, 3);
Log(items);          // [1, 2, 3]

var reversedItems = items.ToReversed();
Log(reversedItems);  // [3, 2, 1]
Log(items);          // [1, 2, 3]
```

### Arr.Join()
The Join() method of Arr instances creates and returns a string by concatenating all of the elements in the array, separated by commas or a specified separator string. If the array has only one item, then that item will be returned without using the separator.

Non-string values will be converted to strings. Null values will be replaced by empty strings.

#### Example
```cs
var elements = Arr("Fire", "Air", "Water");

Log(elements.Join());      // Expected output: "Fire,Air,Water"

Log(elements.Join(", "));  // Expected output: "Fire, Air, Water"

Log(elements.Join(""));    // Expected output: "FireAirWater"

Log(elements.Join("-"));   // Expected output: "Fire-Air-Water"
```

### Arr.Flat()
The Flat() method of Arr instances creates a new array with all sub-array elements concatenated into it recursively up to the specified depth.

#### Syntax
```cs
Arr.Flat();  // flatten with depth 1
Arr.Flat(1); // flatten with depth 1
Arr.Flat(2); // flatten with depth 2
Arr.Flat(n); // flatten with depth n
```

#### Example
```cs
var arr1 = Arr(0, 1, 2, Arr(3, 4));

Log(arr1.Flat());
// Expected output: [0, 1, 2, 3, 4]

var arr2 = Arr(0, 1, Arr(2, Arr(3, Arr(4, 5))));

Log(arr2.Flat());
// Expected output: [ 0, 1, 2, [ 3, [4, 5] ] ]

Log(arr2.Flat(2));
// Expected output: [ 0, 1, 2, 3, [4, 5] ]

Log(arr2.Flat(3));
// Expected output: [0, 1, 2, 3, 4, 5]
```

### Arr.ForEach()
The ForEach() method of Arr instances executes a provided function once for each array element.

#### Syntax
```cs
ForEach(callbackFunction)
```

The callback function you provide is called with 3 arguments (of which the latter two are optional for you to use): **element** (the current element), **index** (the current index), **array** (the whole array). The callback function is not expected  to return anything.

#### Example
```cs
var animals = Arr("dog", "cat", "snake");

animals.ForEach(animal => Log(animal));
// Expected output (3 lines): "dog", "cat", "snake"

// The above call to ForEach is equivalent to,
// but more compact than, a foreach loop:
foreach (var animal in animals)
{
    Log(animal);
}

animals.ForEach((animal, i) => Log($"{i + 1}. {animal}"));
// Expected output (3 lines): "1. dog", "2. cat", "3. snake"

// The above call to ForEach is equivalent to,
// but more compact than, a for loop:
for (var i = 0; i < animals.Length; i++)
{
    Log($"{i + 1}. {animals[i]}");
}
```

### Arr.Map()
The Map() method of Arr instances creates a new array populated with the results of calling a provided function on every element in the original array.

#### Syntax
```cs
Map(callbackFunction)
```

The callback function you provide is called with 3 arguments (of which the latter two are optional for you to use): **element** (the current element), **index** (the current index), **array** (the whole array). You can return any data type.

#### Example 1
```cs
var numbers = Arr(1, 4, 9, 16);

var map1 = numbers.Map(x => x * 2);
Log(map1);
// Expected output: Array [2, 8, 18, 32]

var map2 = numbers.Map((x, i) => x * i);
Log(map2);
// Expected output: Array [0, 4, 18, 48]
```

#### Example 2
When you work with arrays of objects the Map method can often be used in conjunction with a spread to create new objects based on the old ones, but with additional, calculated properties:

```cs
var people = Arr(
    new { name = "Tom", heightFeet = Arr(5, 11) },
    new { name = "Anna", heightFeet = Arr(5, 5) },
    new { name = "Jean", heightFeet = Arr(6, 2) }
);

var people2 = people.Map(x => new
{
    // spread the original properties
    ___ = x,
    // add a new property
    heightCm = Math.Round(
        (x.heightFeet[0] * 12 + x.heightFeet[1]) * 2.54)
});

Log(people2);
/* Expected output:
[
    { "name": "Tom" , "heightFeet": [5, 11], "heightCm": 180 },
    { "name": "Anna", "heightFeet": [5,  5], "heightCm": 165 },
    { "name": "Jean", "heightFeet": [6,  2], "heightCm": 188 }
] */
```

### Arr.Filter()
The Filter() method of Arr instances creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that the provided testing function returns true for.

#### Syntax
```cs
Filter(callbackFunction)
```

The callback function you provide is called with 3 arguments (of which the latter two are optional for you to use): **element** (the current element), **index** (the current index), **array** (the whole array). You are expected to return a boolean.

#### Example 1
```cs
var words = Arr("exuberant", "spray", "elite", "destruction", "present");

var result = words.Filter(word => word.Length > 6);

Log(result);
// Expected output: ["exuberant", "destruction", "present"]
```

#### Example 2
When you work with arrays of objects the Filter method is good for filtering an array based on different object properties:

```cs
var cats = Arr(
    new { name = "Garfield", favoriteFood = Arr("lasagna", "meat balls") },
    new { name = "Fritz", favoriteFood = Arr("cheese", "champagne") },
    new { name = "Tom", favoriteFood = Arr("mice", "lasagna") }
);

var catsThatLikeLasagna =
    cats.Filter(x => x.favoriteFood.Includes("lasagna"));

Log(catsThatLikeLasagna);
/* Expected output:
[
    { "name": "Garfield", "favoriteFood": ["lasagna", "meat balls"] },
    { "name": "Tom"     , "favoriteFood": ["mice"   , "lasagna"   ] }
] */
```

### Arr.Find()
The Find() method of Arr instances returns the first element in the provided array that satisfies the provided testing function. If no values satisfy the testing function, null is returned.

> **Note:**
> * If you need the index of the found element in the array, use FindIndex().
> * If you need to find the index of a value, use IndexOf(). (It's similar to FindIndex(), but checks each element for equality with the value instead of using a testing function.)
> * If you need to find if a value exists in an array, use Includes(). Again, it checks each element for equality with the value instead of using a testing function.
> * If you need to find if any element satisfies the provided testing function, use Some().
> * If you need to find all elements that satisfy the provided testing function, use Filter().

#### Syntax
```cs
Find(callbackFunction)
```

The callback function you provide is called with 3 arguments (of which the latter two are optional for you to use): **element** (the current element), **index** (the current index), **array** (the whole array). You are expected to return a boolean.

#### Example
```cs
var numbers = Arr(5, 12, 8, 130, 44);

var found = numbers.Find(x => x > 10);

Log(found);    // Expected output: 12

var found2 = numbers.Find(x => x > 300);

Log(found2);   // Expected output: null
```

### Arr.FindIndex()
The FindIndex() method of Arr instances returns the index of the first element in an array that satisfies the provided testing function. If no elements satisfy the testing function, -1 is returned.

See also the Find() method, which returns the first element that satisfies the testing function (rather than its index).

#### Syntax
```cs
FindIndex(callbackFunction)
```

The callback function you provide is called with 3 arguments (of which the latter two are optional for you to use): **element** (the current element), **index** (the current index), **array** (the whole array). You are expected to return a boolean.

#### Example
```cs
var numbers = Arr(5, 12, 8, 130, 44);

var largeNumberIndex = numbers.FindIndex(x => x > 100);

Log(largeNumberIndex);     // Expected output: 3

var negativeNumberIndex = numbers.FindIndex(x => x < 0);

Log(negativeNumberIndex);  // Expected output: -1
```

### Arr.FindLast()
The FindLast() method of Arr instances iterates the array in reverse order and returns the value of the first element that satisfies the provided testing function. If no elements satisfy the testing function, null is returned.

#### Syntax
```cs
FindLast(callbackFunction)
```

The callback function you provide is called with 3 arguments (of which the latter two are optional for you to use): **element** (the current element), **index** (the current index), **array** (the whole array). You are expected to return a boolean.

#### Example
```cs
var numbers = Arr(5, 12, 50, 130, 44);

var found = numbers.FindLast(x => x > 45);

Log(found);  // Expected output: 130
```

### Arr.FindLastIndex()
The FindLastIndex() method of Arr instances iterates the array in reverse order and returns the index of the first element that satisfies the provided testing function. If no elements satisfy the testing function, -1 is returned.

See also the FindLast() method, which returns the value of last element that satisfies the testing function (rather than its index).

#### Syntax
```cs
FindLastIndex(callbackFunction)
```

The callback function you provide is called with 3 arguments (of which the latter two are optional for you to use): **element** (the current element), **index** (the current index), **array** (the whole array). You are expected to return a boolean.

#### Example
```cs
var numbers = Arr(5, 12, 50, 130, 44);

var found = numbers.FindLastIndex(x => x > 45);

Log(found);  // Expected output: 3
```

### Arr.Some()
The Some() method of Arr instances tests whether at least one element in the array passes the test implemented by the provided function. It returns true if the provided function returns true for at least one element.

#### Syntax
```cs
Some(callbackFunction)
```

The callback function you provide is called with 3 arguments (of which the latter two are optional for you to use): **element** (the current element), **index** (the current index), **array** (the whole array). You are expected to return a boolean.

#### Example
```cs
var numbers = Arr(1, 2, 3, 4, 5, 6, -2, 7);

var hasNegativeNumbers = numbers.Some(x => x < 0);
Log(hasNegativeNumbers);  // Expected output: true

var hasNumbersAbove100 = numbers.Some(x => x > 100);
Log(hasNumbersAbove100);  // Expected output: false
```

### Arr.Every()
The Every() method of Arr instances tests whether all elements in the array pass the test implemented by the provided function. It returns true if the provided function returns true for all elements.

#### Syntax
```cs
Some(callbackFunction)
```

The callback function you provide is called with 3 arguments (of which the latter two are optional for you to use): **element** (the current element), **index** (the current index), **array** (the whole array). You are expected to return a boolean.

#### Example
```cs
var numbers = Arr(1, 2, 3, 4, 5, 6, 7);

var onlyPositiveNumbers = numbers.Every(x => x > 0);
Log(onlyPositiveNumbers);  // Expected output: true

var onlyNumbersBelow5 = numbers.Every(x => x < 5);
Log(onlyNumbersBelow5);   // Expected output: false
```

### Arr.Reduce()
The Reduce() method of Arr instances executes a user-supplied "reducer" callback function on each element of the array, in order, passing in the return value from the calculation on the preceding element. The final result of running the reducer across all elements is a single value.

#### Syntax
```cs
Reduce(callbackFunction)
Reduce(callbackFunction, initialValue)
```

The callback function you provide is called with 4 arguments (of which the latter two are optional for you to use): **accumulator** (the value from the previous call to the callback function or the initialValue, see below), **currentValue** (the value of the current element), **index** (the current index), **array** (the whole array). You can return any data type.

>**Note:** The first time that the callback is run there is no "return value of the previous calculation". If supplied, an initial value may be used in its place. Otherwise the first array element is used as the initial value and iteration starts from the next element.

#### Example 1
```cs
var numbers = Arr(1, 2, 3, 4, 5);

var sum = numbers.Reduce((a, c) => a + c);

Log(sum);  // Expected output: 15
```

#### Example 2
```cs
var people = Arr(
    new { name = "Ava", age = 70 },
    new { name = "Brady", age = 15 },
    new { name = "Cyrus", age = 35 }
);

var ageAverage = people.Reduce((a, c, i, arr)
    => a + (double)c.age / arr.Length, 0);

Log(ageAverage);  // Expected output: 40.0

var hiAll = people.Reduce((a, c, i, arr) =>
{
    var last = i == arr.Length - 1;
    var secondLast = i == arr.Length - 2;
    var glue = last ? "!" : secondLast ? " and " : ", ";
    return a + c.name + glue;
}, "Hi ");

Log(hiAll);  // Expected output: "Hi Ava, Brady and Cyrus!"
```

### Arr.ReduceRight()
The ReduceRight() method of Arr instances applies a function against an accumulator and each value of the array (from right-to-left) to reduce it to a single value.

See also Arr.Reduce() for left-to-right.

#### Syntax
```cs
ReduceRight(callbackFunction)
ReduceRight(callbackFunction, initialValue)
```

The callback function you provide is called with 4 arguments (of which the latter two are optional for you to use): **accumulator** (the value from the previous call to the callback function or the initialValue, see below), **currentValue** (the value of the current element), **index** (the current index), **array** (the whole array). You can return any data type.

>**Note:** The first time that the callback is run there is no "return value of the previous calculation". If supplied, an initial value may be used in its place. Otherwise the last array element at is used as the initial value and iteration starts from the next element.

#### Example
```cs
var people = Arr(
    new { name = "Ava", age = 70 },
    new { name = "Brady", age = 15 },
    new { name = "Cyrus", age = 35 }
);

var hiAll = people.ReduceRight((a, c, i, arr) =>
{
    var glue = i == 0 ? "!" : i == 1 ? " and " : ", ";
    return a + c.name + glue;
}, "Hi ");

Log(hiAll);  // Expected output: "Hi Cyrus, Brady and Ava!"
```

### MIT License
#### MIT License for Dyndata
Copyright © 2024 ironboy/NodeHill

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.