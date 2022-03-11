#!/usr/bin/env python3

import process
from types import SimpleNamespace

_args = dict(
    filename="./test_single.jpg",
    city="La Plata",
    school="Bachillerato de Bellas Artes",
    age="17",
    file="03235",
)

args = SimpleNamespace(**_args)

try:
    process.process(args)
except Exception as e:
    print(e)
