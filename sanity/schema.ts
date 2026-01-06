import { defineType, defineField } from '@sanity/types';

export const eventSchema = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Event Title',
      type: 'string',
      description: 'Name of the event',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      description: 'Main event image',
      options: {
        hotspot: true, // Enables image cropping
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Event Date',
      type: 'datetime',
      description: 'Date and time of the event',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Full event description',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Event location',
      options: {
        list: [
          { title: 'Suydam', value: 'suydam' },
          { title: 'Bogart', value: 'bogart' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      description: 'Link to Instagram post (if imported)',
    }),
    defineField({
      name: 'importedFromInstagram',
      title: 'Imported from Instagram',
      type: 'boolean',
      description: 'Was this event auto-imported from Instagram?',
      initialValue: false,
    }),
    defineField({
      name: 'postedToDiscord',
      title: 'Posted to Discord',
      type: 'boolean',
      description: 'Has this been posted to Discord?',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When this event was published',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      location: 'location',
      media: 'image',
    },
    prepare({ title, date, location, media }) {
      const dateStr = date ? new Date(date).toLocaleDateString() : 'No date';
      return {
        title: title || 'Untitled Event',
        subtitle: `${dateStr} • ${location || 'No location'}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Event Date, Newest',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Event Date, Oldest',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
  ],
});

export const schema = {
  types: [eventSchema],
};

